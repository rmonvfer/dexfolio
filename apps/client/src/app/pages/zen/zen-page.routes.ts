import { GfHomeHoldingsComponent } from '@dexfolio/client/components/home-holdings/home-holdings.component';
import { GfHomeOverviewComponent } from '@dexfolio/client/components/home-overview/home-overview.component';
import { AuthGuard } from '@dexfolio/client/core/auth.guard';
import { internalRoutes } from '@dexfolio/common/routes/routes';

import { Routes } from '@angular/router';

import { GfZenPageComponent } from './zen-page.component';

export const routes: Routes = [
  {
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: GfHomeOverviewComponent
      },
      {
        path: internalRoutes.zen.subRoutes?.holdings.path,
        component: GfHomeHoldingsComponent,
        title: internalRoutes.home.subRoutes?.holdings.title
      }
    ],
    component: GfZenPageComponent,
    path: '',
    title: internalRoutes.zen.title
  }
];
