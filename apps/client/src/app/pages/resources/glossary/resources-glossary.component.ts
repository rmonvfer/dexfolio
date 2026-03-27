import { InfoItem } from '@dexfolio/common/interfaces';
import { hasPermission, permissions } from '@dexfolio/common/permissions';
import { publicRoutes } from '@dexfolio/common/routes/routes';
import { DataService } from '@dexfolio/ui/services';

import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'gf-resources-glossary',
  styleUrls: ['./resources-glossary.component.scss'],
  templateUrl: './resources-glossary.component.html'
})
export class ResourcesGlossaryPageComponent implements OnInit {
  public hasPermissionForSubscription: boolean;
  public info: InfoItem;
  public routerLinkResourcesPersonalFinanceTools =
    publicRoutes.resources.subRoutes?.personalFinanceTools.routerLink;

  public constructor(private dataService: DataService) {
    this.info = this.dataService.fetchInfo();
  }

  public ngOnInit() {
    this.hasPermissionForSubscription = hasPermission(
      this.info?.globalPermissions,
      permissions.enableSubscription
    );
  }
}
