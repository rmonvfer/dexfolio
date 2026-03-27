import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  host: { class: 'page' },
  imports: [MatButtonModule, RouterModule],
  selector: 'gf-dexfolio-auf-sackgeld-vorgestellt-page',
  templateUrl: './dexfolio-auf-sackgeld-vorgestellt-page.html'
})
export class dexfolioAufSackgeldVorgestelltPageComponent {
  public routerLinkBlog = publicRoutes.blog.routerLink;
}
