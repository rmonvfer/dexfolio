import { AuthGuard } from '@dexfolio/client/core/auth.guard';
import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Routes } from '@angular/router';

import { GfLandingPageComponent } from './landing-page.component';

export const routes: Routes = [
  {
    canActivate: [AuthGuard],
    component: GfLandingPageComponent,
    path: '',
    title: publicRoutes.register.title
  }
];
