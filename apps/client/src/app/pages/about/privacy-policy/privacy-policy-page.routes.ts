import { AuthGuard } from '@dexfolio/client/core/auth.guard';
import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Routes } from '@angular/router';

import { GfPrivacyPolicyPageComponent } from './privacy-policy-page.component';

export const routes: Routes = [
  {
    canActivate: [AuthGuard],
    component: GfPrivacyPolicyPageComponent,
    path: '',
    title: publicRoutes.about.subRoutes?.privacyPolicy.title
  }
];
