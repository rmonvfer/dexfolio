import { AuthGuard } from '@dexfolio/client/core/auth.guard';
import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Routes } from '@angular/router';

import { GfOpenSourceSoftwareFriendsPageComponent } from './oss-friends-page.component';

export const routes: Routes = [
  {
    canActivate: [AuthGuard],
    component: GfOpenSourceSoftwareFriendsPageComponent,
    path: '',
    title: publicRoutes.about.subRoutes?.ossFriends.title
  }
];
