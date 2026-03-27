import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  host: { class: 'page' },
  imports: [MatButtonModule, RouterModule],
  selector: 'gf-dexfolio-joins-oss-friends-page',
  templateUrl: './dexfolio-joins-oss-friends-page.html'
})
export class dexfolioJoinsOssFriendsPageComponent {
  public routerLinkAboutOssFriends =
    publicRoutes.about.subRoutes?.ossFriends.routerLink;
  public routerLinkBlog = publicRoutes.blog.routerLink;
}
