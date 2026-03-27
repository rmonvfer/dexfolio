import { AuthGuard } from '@dexfolio/client/core/auth.guard';
import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Routes } from '@angular/router';

import { GfChangelogPageComponent } from './changelog-page.component';

export const routes: Routes = [
  {
    canActivate: [AuthGuard],
    component: GfChangelogPageComponent,
    path: '',
    title: publicRoutes.about.subRoutes?.changelog.title
  }
];
