import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  host: { class: 'page' },
  imports: [MatButtonModule, RouterModule],
  selector: 'gf-hello-dexfolio-page',
  templateUrl: './hello-dexfolio-page.html'
})
export class HellodexfolioPageComponent {
  public routerLinkBlog = publicRoutes.blog.routerLink;
  public routerLinkPricing = publicRoutes.pricing.routerLink;
  public routerLinkResources = publicRoutes.resources.routerLink;
}
