import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  host: { class: 'page' },
  imports: [MatButtonModule, RouterModule],
  selector: 'gf-dexfolio-meets-internet-identity-page',
  templateUrl: './dexfolio-meets-internet-identity-page.html'
})
export class dexfolioMeetsInternetIdentityPageComponent {
  public routerLinkBlog = publicRoutes.blog.routerLink;
}
