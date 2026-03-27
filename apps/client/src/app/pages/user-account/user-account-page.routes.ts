import { GfUserAccountAccessComponent } from '@dexfolio/client/components/user-account-access/user-account-access.component';
import { GfUserAccountMembershipComponent } from '@dexfolio/client/components/user-account-membership/user-account-membership.component';
import { GfUserAccountSettingsComponent } from '@dexfolio/client/components/user-account-settings/user-account-settings.component';
import { AuthGuard } from '@dexfolio/client/core/auth.guard';
import { internalRoutes } from '@dexfolio/common/routes/routes';

import { Routes } from '@angular/router';

import { GfUserAccountPageComponent } from './user-account-page.component';

export const routes: Routes = [
  {
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: GfUserAccountSettingsComponent,
        title: internalRoutes.account.title
      },
      {
        path: internalRoutes.account.subRoutes?.membership.path,
        component: GfUserAccountMembershipComponent,
        title: internalRoutes.account.subRoutes?.membership.title
      },
      {
        path: internalRoutes.account.subRoutes?.access.path,
        component: GfUserAccountAccessComponent,
        title: internalRoutes.account.subRoutes?.access.title
      }
    ],
    component: GfUserAccountPageComponent,
    path: '',
    title: $localize`My dexfolio`
  }
];
