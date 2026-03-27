import { AuthGuard } from '@dexfolio/client/core/auth.guard';
import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Routes } from '@angular/router';

import { GfOpenPageComponent } from './open-page.component';

export const routes: Routes = [
  {
    canActivate: [AuthGuard],
    component: GfOpenPageComponent,
    path: '',
    title: publicRoutes.openStartup.title
  }
];
