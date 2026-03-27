import { GfAdminPlatformComponent } from '@dexfolio/client/components/admin-platform/admin-platform.component';
import { GfAdminTagComponent } from '@dexfolio/client/components/admin-tag/admin-tag.component';
import { GfDataProviderStatusComponent } from '@dexfolio/client/components/data-provider-status/data-provider-status.component';
import { UserService } from '@dexfolio/client/services/user/user.service';
import { PROPERTY_API_KEY_dexfolio } from '@dexfolio/common/config';
import { ConfirmationDialogType } from '@dexfolio/common/enums';
import { getDateFormatString } from '@dexfolio/common/helper';
import {
  DataProviderDexfolioStatusResponse,
  DataProviderInfo,
  User
} from '@dexfolio/common/interfaces';
import { publicRoutes } from '@dexfolio/common/routes/routes';
import { GfEntityLogoComponent } from '@dexfolio/ui/entity-logo';
import { NotificationService } from '@dexfolio/ui/notifications';
import { GfPremiumIndicatorComponent } from '@dexfolio/ui/premium-indicator';
import { AdminService, DataService } from '@dexfolio/ui/services';
import { GfValueComponent } from '@dexfolio/ui/value';

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ellipsisHorizontal, trashOutline } from 'ionicons/icons';
import { get } from 'lodash';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { catchError, filter, of } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    GfAdminPlatformComponent,
    GfAdminTagComponent,
    GfDataProviderStatusComponent,
    GfEntityLogoComponent,
    GfPremiumIndicatorComponent,
    GfValueComponent,
    IonIcon,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatProgressBarModule,
    MatSortModule,
    MatTableModule,
    NgxSkeletonLoaderModule,
    RouterModule
  ],
  selector: 'gf-admin-settings',
  styleUrls: ['./admin-settings.component.scss'],
  templateUrl: './admin-settings.component.html'
})
export class GfAdminSettingsComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;

  public dataSource = new MatTableDataSource<DataProviderInfo>();
  public defaultDateFormat: string;
  public displayedColumns = [
    'name',
    'status',
    'assetProfileCount',
    'usage',
    'actions'
  ];
  public dexfolioApiStatus: DataProviderDexfolioStatusResponse;
  public isdexfolioApiKeyValid: boolean;
  public isLoading = false;
  public pricingUrl: string;
  public user: User;

  public constructor(
    private adminService: AdminService,
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    private destroyRef: DestroyRef,
    private notificationService: NotificationService,
    private userService: UserService
  ) {
    addIcons({ ellipsisHorizontal, trashOutline });
  }

  public ngOnInit() {
    this.userService.stateChanged
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        if (state?.user) {
          this.user = state.user;

          this.defaultDateFormat = getDateFormatString(
            this.user.settings.locale
          );

          const languageCode = this.user.settings.language;

          this.pricingUrl = `https://dexfol.io/${languageCode}/${publicRoutes.pricing.path}`;

          this.changeDetectorRef.markForCheck();
        }
      });

    this.initialize();
  }

  public isdexfolioDataProvider(provider: DataProviderInfo): boolean {
    return provider.dataSource === 'DEXFOLIO';
  }

  public onRemovedexfolioApiKey() {
    this.notificationService.confirm({
      confirmFn: () => {
        this.dataService
          .putAdminSetting(PROPERTY_API_KEY_dexfolio, { value: undefined })
          .subscribe(() => {
            this.initialize();
          });
      },
      confirmType: ConfirmationDialogType.Warn,
      title: $localize`Do you really want to delete the API key?`
    });
  }

  public onSetdexfolioApiKey() {
    this.notificationService.prompt({
      confirmFn: (value) => {
        const dexfolioApiKey = value?.trim();

        if (dexfolioApiKey) {
          this.dataService
            .putAdminSetting(PROPERTY_API_KEY_dexfolio, {
              value: dexfolioApiKey
            })
            .subscribe(() => {
              this.initialize();
            });
        }
      },
      title: $localize`Please enter your dexfolio API key.`
    });
  }

  private initialize() {
    this.isLoading = true;

    this.dataSource = new MatTableDataSource();

    this.adminService
      .fetchAdminData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ dataProviders, settings }) => {
        const filteredProviders = dataProviders.filter(({ dataSource }) => {
          return dataSource !== 'MANUAL';
        });

        this.dataSource = new MatTableDataSource(filteredProviders);
        this.dataSource.sort = this.sort;
        this.dataSource.sortingDataAccessor = get;

        const dexfolioApiKey = settings[
          PROPERTY_API_KEY_dexfolio
        ] as string;

        if (dexfolioApiKey) {
          this.adminService
            .fetchDexfolioDataProviderStatus(dexfolioApiKey)
            .pipe(
              catchError(() => {
                this.isdexfolioApiKeyValid = false;

                this.changeDetectorRef.markForCheck();

                return of(null);
              }),
              filter((status) => {
                return status !== null;
              }),
              takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((status) => {
              this.dexfolioApiStatus = status;
              this.isdexfolioApiKeyValid = true;

              this.changeDetectorRef.markForCheck();
            });
        } else {
          this.isdexfolioApiKeyValid = false;
        }

        this.isLoading = false;

        this.changeDetectorRef.markForCheck();
      });
  }
}
