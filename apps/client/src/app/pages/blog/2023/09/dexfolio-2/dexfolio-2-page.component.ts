import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  host: { class: 'page' },
  imports: [MatButtonModule, RouterModule],
  selector: 'gf-dexfolio-2-page',
  templateUrl: './dexfolio-2-page.html'
})
export class Dexfolio2PageComponent {
  public routerLinkAbout = publicRoutes.about.routerLink;
  public routerLinkAboutChangelog =
    publicRoutes.about.subRoutes.changelog.routerLink;
  public routerLinkBlog = publicRoutes.blog.routerLink;
  public routerLinkFeatures = publicRoutes.features.routerLink;
  public routerLinkMarkets = publicRoutes.markets.routerLink;
}
