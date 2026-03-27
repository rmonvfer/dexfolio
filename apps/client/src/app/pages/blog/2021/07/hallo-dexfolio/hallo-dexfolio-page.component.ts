import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  host: { class: 'page' },
  imports: [MatButtonModule, RouterModule],
  selector: 'gf-hallo-dexfolio-page',
  templateUrl: './hallo-dexfolio-page.html'
})
export class HallodexfolioPageComponent {
  public routerLinkBlog = publicRoutes.blog.routerLink;
  public routerLinkPricing = publicRoutes.pricing.routerLink;
  public routerLinkResources = publicRoutes.resources.routerLink;
}
