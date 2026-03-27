import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Routes } from '@angular/router';

import { ResourcesGuidesComponent } from './resources-guides.component';

export const routes: Routes = [
  {
    component: ResourcesGuidesComponent,
    path: '',
    title: publicRoutes.resources.subRoutes?.guides.title
  }
];
