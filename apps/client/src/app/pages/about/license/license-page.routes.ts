import { AuthGuard } from '@dexfolio/client/core/auth.guard';
import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Routes } from '@angular/router';

import { GfLicensePageComponent } from './license-page.component';

export const routes: Routes = [
  {
    canActivate: [AuthGuard],
    component: GfLicensePageComponent,
    path: '',
    title: publicRoutes.about.subRoutes?.license.title
  }
];
