import { UserService } from '@dexfolio/client/services/user/user.service';
import { User } from '@dexfolio/common/interfaces';
import { publicRoutes } from '@dexfolio/common/routes/routes';
import { GfPremiumIndicatorComponent } from '@dexfolio/ui/premium-indicator';

import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  host: { class: 'page' },
  imports: [GfPremiumIndicatorComponent, MatCardModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'gf-faq-overview-page',
  styleUrls: ['./faq-overview-page.scss'],
  templateUrl: './faq-overview-page.html'
})
export class GfFaqOverviewPageComponent implements OnDestroy {
  public pricingUrl = `https://dexfol.io/${document.documentElement.lang}/${publicRoutes.pricing.path}`;
  public routerLinkFeatures = publicRoutes.features.routerLink;
  public user: User;

  private unsubscribeSubject = new Subject<void>();

  public constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private userService: UserService
  ) { }

  public ngOnInit() {
    this.userService.stateChanged
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((state) => {
        if (state?.user) {
          this.user = state.user;

          this.changeDetectorRef.markForCheck();
        }
      });
  }

  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }
}
