import { AuthGuard } from '@dexfolio/client/core/auth.guard';
import { internalRoutes } from '@dexfolio/common/routes/routes';

import { Routes } from '@angular/router';

import { GfAccountsPageComponent } from './accounts-page.component';

export const routes: Routes = [
  {
    canActivate: [AuthGuard],
    component: GfAccountsPageComponent,
    path: '',
    title: internalRoutes.accounts.title
  }
];
