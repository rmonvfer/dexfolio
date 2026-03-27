import { AuthGuard } from '@dexfolio/client/core/auth.guard';
import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Routes } from '@angular/router';

import { GfRegisterPageComponent } from './register-page.component';

export const routes: Routes = [
  {
    canActivate: [AuthGuard],
    component: GfRegisterPageComponent,
    path: '',
    title: publicRoutes.register.title
  }
];
