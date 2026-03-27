import { GfRulesComponent } from '@dexfolio/client/components/rules/rules.component';
import { ImpersonationStorageService } from '@dexfolio/client/services/impersonation-storage.service';
import { UserService } from '@dexfolio/client/services/user/user.service';
import { UpdateUserSettingDto } from '@dexfolio/common/dtos';
import {
  PortfolioReportResponse,
  PortfolioReportRule
} from '@dexfolio/common/interfaces';
import { User } from '@dexfolio/common/interfaces/user.interface';
import { hasPermission, permissions } from '@dexfolio/common/permissions';
import { GfPremiumIndicatorComponent } from '@dexfolio/ui/premium-indicator';
import { DataService } from '@dexfolio/ui/services';

import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  removeCircleOutline,
  warningOutline
} from 'ionicons/icons';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  imports: [
    GfPremiumIndicatorComponent,
    GfRulesComponent,
    IonIcon,
    NgClass,
    NgxSkeletonLoaderModule
  ],
  selector: 'gf-x-ray-page',
  styleUrl: './x-ray-page.component.scss',
  templateUrl: './x-ray-page.component.html'
})
export class GfXRayPageComponent {
  public categories: {
    key: string;
    name: string;
    rules: PortfolioReportRule[];
  }[];
  public hasImpersonationId: boolean;
  public hasPermissionToUpdateUserSettings: boolean;
  public inactiveRules: PortfolioReportRule[];
  public isLoading = false;
  public statistics: PortfolioReportResponse['xRay']['statistics'];
  public user: User;

  public constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    private destroyRef: DestroyRef,
    private impersonationStorageService: ImpersonationStorageService,
    private userService: UserService
  ) {
    addIcons({ checkmarkCircleOutline, removeCircleOutline, warningOutline });
  }

  public ngOnInit() {
    this.impersonationStorageService
      .onChangeHasImpersonation()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((impersonationId) => {
        this.hasImpersonationId = !!impersonationId;
      });

    this.userService.stateChanged
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        if (state?.user) {
          this.user = state.user;

          this.hasPermissionToUpdateUserSettings =
            this.user.subscription?.type === 'Basic'
              ? false
              : hasPermission(
                this.user.permissions,
                permissions.updateUserSettings
              );

          this.changeDetectorRef.markForCheck();
        }
      });

    this.initializePortfolioReport();
  }

  public onRulesUpdated(event: UpdateUserSettingDto) {
    this.dataService
      .putUserSetting(event)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.userService
          .get(true)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe();

        this.initializePortfolioReport();
      });
  }

  private initializePortfolioReport() {
    this.isLoading = true;

    this.dataService
      .fetchPortfolioReport()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ xRay: { categories, statistics } }) => {
        this.categories = categories;
        this.inactiveRules = this.mergeInactiveRules(categories);
        this.statistics = statistics;

        this.isLoading = false;

        this.changeDetectorRef.markForCheck();
      });
  }

  private mergeInactiveRules(
    categories: PortfolioReportResponse['xRay']['categories']
  ): PortfolioReportRule[] {
    return categories.flatMap(({ rules }) => {
      return (
        rules?.filter(({ isActive }) => {
          return !isActive;
        }) ?? []
      );
    });
  }
}
