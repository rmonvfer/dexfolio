import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  host: { class: 'page' },
  imports: [MatButtonModule, RouterModule],
  selector: 'gf-dexfolio-meets-umbrel-page',
  templateUrl: './dexfolio-meets-umbrel-page.html'
})
export class dexfolioMeetsUmbrelPageComponent {
  public routerLinkBlog = publicRoutes.blog.routerLink;
}
