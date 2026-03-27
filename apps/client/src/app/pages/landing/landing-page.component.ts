import { hasPermission, permissions } from '@dexfolio/common/permissions';
import { publicRoutes } from '@dexfolio/common/routes/routes';
import { GfLogoComponent } from '@dexfolio/ui/logo';
import { DataService } from '@dexfolio/ui/services';

import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  host: { class: 'page' },
  imports: [GfLogoComponent, MatButtonModule, RouterModule],
  selector: 'gf-landing-page',
  styleUrls: ['./landing-page.scss'],
  templateUrl: './landing-page.html'
})
export class GfLandingPageComponent {
  public hasPermissionForDemo: boolean;
  public hasPermissionToCreateUser: boolean;
  public routerLinkDemo = publicRoutes.demo.routerLink;
  public routerLinkRegister = publicRoutes.register.routerLink;

  public constructor(private dataService: DataService) {
    const { demoAuthToken, globalPermissions } =
      this.dataService.fetchInfo();

    this.hasPermissionForDemo = !!demoAuthToken;

    this.hasPermissionToCreateUser = hasPermission(
      globalPermissions,
      permissions.createUserAccount
    );
  }
}
