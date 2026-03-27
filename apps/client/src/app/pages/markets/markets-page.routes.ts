import { AuthGuard } from '@dexfolio/client/core/auth.guard';
import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Routes } from '@angular/router';

import { GfMarketsPageComponent } from './markets-page.component';

export const routes: Routes = [
  {
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./markets-page.component').then(
            (m) => m.GfMarketsPageComponent
          )
      }
    ],
    component: GfMarketsPageComponent,
    path: '',
    title: publicRoutes.markets.title
  }
];
