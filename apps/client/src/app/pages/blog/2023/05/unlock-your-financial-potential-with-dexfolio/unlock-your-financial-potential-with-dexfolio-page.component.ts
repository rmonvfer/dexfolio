import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  host: { class: 'page' },
  imports: [MatButtonModule, RouterModule],
  selector: 'gf-unlock-your-financial-potential-with-dexfolio-page',
  templateUrl: './unlock-your-financial-potential-with-dexfolio-page.html'
})
export class UnlockYourFinancialPotentialWithdexfolioPageComponent {
  public routerLinkBlog = publicRoutes.blog.routerLink;
  public routerLinkFeatures = publicRoutes.features.routerLink;
  public routerLinkResources = publicRoutes.resources.routerLink;
}
