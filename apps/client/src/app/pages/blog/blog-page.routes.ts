import { AuthGuard } from '@dexfolio/client/core/auth.guard';
import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Routes } from '@angular/router';

import { GfBlogPageComponent } from './blog-page.component';

export const routes: Routes = [
  {
    canActivate: [AuthGuard],
    component: GfBlogPageComponent,
    path: '',
    title: publicRoutes.blog.title
  },
  {
    canActivate: [AuthGuard],
    path: '2021/07/hallo-dexfolio',
    loadComponent: () =>
      import('./2021/07/hallo-dexfolio/hallo-dexfolio-page.component').then(
        (c) => c.HallodexfolioPageComponent
      ),
    title: 'Hallo dexfolio'
  },
  {
    canActivate: [AuthGuard],
    path: '2021/07/hello-dexfolio',
    loadComponent: () =>
      import('./2021/07/hello-dexfolio/hello-dexfolio-page.component').then(
        (c) => c.HellodexfolioPageComponent
      ),
    title: 'Hello dexfolio'
  },
  {
    canActivate: [AuthGuard],
    path: '2022/01/dexfolio-first-months-in-open-source',
    loadComponent: () =>
      import('./2022/01/first-months-in-open-source/first-months-in-open-source-page.component').then(
        (c) => c.FirstMonthsInOpenSourcePageComponent
      ),
    title: 'First months in Open Source'
  },
  {
    canActivate: [AuthGuard],
    path: '2022/07/dexfolio-meets-internet-identity',
    loadComponent: () =>
      import('./2022/07/dexfolio-meets-internet-identity/dexfolio-meets-internet-identity-page.component').then(
        (c) => c.dexfolioMeetsInternetIdentityPageComponent
      ),
    title: 'dexfolio meets Internet Identity'
  },
  {
    canActivate: [AuthGuard],
    path: '2022/07/how-do-i-get-my-finances-in-order',
    loadComponent: () =>
      import('./2022/07/how-do-i-get-my-finances-in-order/how-do-i-get-my-finances-in-order-page.component').then(
        (c) => c.HowDoIGetMyFinancesInOrderPageComponent
      ),
    title: 'How do I get my finances in order?'
  },
  {
    canActivate: [AuthGuard],
    path: '2022/08/500-stars-on-github',
    loadComponent: () =>
      import('./2022/08/500-stars-on-github/500-stars-on-github-page.component').then(
        (c) => c.FiveHundredStarsOnGitHubPageComponent
      ),
    title: '500 Stars on GitHub'
  },
  {
    canActivate: [AuthGuard],
    path: '2022/10/hacktoberfest-2022',
    loadComponent: () =>
      import('./2022/10/hacktoberfest-2022/hacktoberfest-2022-page.component').then(
        (c) => c.Hacktoberfest2022PageComponent
      ),
    title: 'Hacktoberfest 2022'
  },
  {
    canActivate: [AuthGuard],
    path: '2022/11/black-friday-2022',
    loadComponent: () =>
      import('./2022/11/black-friday-2022/black-friday-2022-page.component').then(
        (c) => c.BlackFriday2022PageComponent
      ),
    title: 'Black Friday 2022'
  },
  {
    canActivate: [AuthGuard],
    path: '2022/12/the-importance-of-tracking-your-personal-finances',
    loadComponent: () =>
      import('./2022/12/the-importance-of-tracking-your-personal-finances/the-importance-of-tracking-your-personal-finances-page.component').then(
        (c) => c.TheImportanceOfTrackingYourPersonalFinancesPageComponent
      ),
    title: 'The importance of tracking your personal finances'
  },
  {
    canActivate: [AuthGuard],
    path: '2023/01/dexfolio-auf-sackgeld-vorgestellt',
    loadComponent: () =>
      import('./2023/01/dexfolio-auf-sackgeld-vorgestellt/dexfolio-auf-sackgeld-vorgestellt-page.component').then(
        (c) => c.dexfolioAufSackgeldVorgestelltPageComponent
      ),
    title: 'dexfolio auf Sackgeld.com vorgestellt'
  },
  {
    canActivate: [AuthGuard],
    path: '2023/02/dexfolio-meets-umbrel',
    loadComponent: () =>
      import('./2023/02/dexfolio-meets-umbrel/dexfolio-meets-umbrel-page.component').then(
        (c) => c.dexfolioMeetsUmbrelPageComponent
      ),
    title: 'dexfolio meets Umbrel'
  },
  {
    canActivate: [AuthGuard],
    path: '2023/03/dexfolio-reaches-1000-stars-on-github',
    loadComponent: () =>
      import('./2023/03/1000-stars-on-github/1000-stars-on-github-page.component').then(
        (c) => c.ThousandStarsOnGitHubPageComponent
      ),
    title: 'dexfolio reaches 1’000 Stars on GitHub'
  },
  {
    canActivate: [AuthGuard],
    path: '2023/05/unlock-your-financial-potential-with-dexfolio',
    loadComponent: () =>
      import('./2023/05/unlock-your-financial-potential-with-dexfolio/unlock-your-financial-potential-with-dexfolio-page.component').then(
        (c) => c.UnlockYourFinancialPotentialWithdexfolioPageComponent
      ),
    title: 'Unlock your Financial Potential with dexfolio'
  },
  {
    canActivate: [AuthGuard],
    path: '2023/07/exploring-the-path-to-fire',
    loadComponent: () =>
      import('./2023/07/exploring-the-path-to-fire/exploring-the-path-to-fire-page.component').then(
        (c) => c.ExploringThePathToFirePageComponent
      ),
    title: 'Exploring the Path to FIRE'
  },
  {
    canActivate: [AuthGuard],
    path: '2023/08/dexfolio-joins-oss-friends',
    loadComponent: () =>
      import('./2023/08/dexfolio-joins-oss-friends/dexfolio-joins-oss-friends-page.component').then(
        (c) => c.dexfolioJoinsOssFriendsPageComponent
      ),
    title: 'dexfolio joins OSS Friends'
  },
  {
    canActivate: [AuthGuard],
    path: '2023/09/dexfolio-2',
    loadComponent: () =>
      import('./2023/09/dexfolio-2/dexfolio-2-page.component').then(
        (c) => c.Dexfolio2PageComponent
      ),
    title: 'dexfolio 2.0'
  },
  {
    canActivate: [AuthGuard],
    path: '2023/09/hacktoberfest-2023',
    loadComponent: () =>
      import('./2023/09/hacktoberfest-2023/hacktoberfest-2023-page.component').then(
        (c) => c.Hacktoberfest2023PageComponent
      ),
    title: 'Hacktoberfest 2023'
  },
  {
    canActivate: [AuthGuard],
    path: '2023/11/black-week-2023',
    loadComponent: () =>
      import('./2023/11/black-week-2023/black-week-2023-page.component').then(
        (c) => c.BlackWeek2023PageComponent
      ),
    title: 'Black Week 2023'
  },
  {
    canActivate: [AuthGuard],
    path: '2023/11/hacktoberfest-2023-debriefing',
    loadComponent: () =>
      import('./2023/11/hacktoberfest-2023-debriefing/hacktoberfest-2023-debriefing-page.component').then(
        (c) => c.Hacktoberfest2023DebriefingPageComponent
      ),
    title: 'Hacktoberfest 2023 Debriefing'
  },
  {
    canActivate: [AuthGuard],
    path: '2024/09/hacktoberfest-2024',
    loadComponent: () =>
      import('./2024/09/hacktoberfest-2024/hacktoberfest-2024-page.component').then(
        (c) => c.Hacktoberfest2024PageComponent
      ),
    title: 'Hacktoberfest 2024'
  },
  {
    canActivate: [AuthGuard],
    path: '2024/11/black-weeks-2024',
    loadComponent: () =>
      import('./2024/11/black-weeks-2024/black-weeks-2024-page.component').then(
        (c) => c.BlackWeeks2024PageComponent
      ),
    title: 'Black Weeks 2024'
  },
  {
    canActivate: [AuthGuard],
    path: '2025/09/hacktoberfest-2025',
    loadComponent: () =>
      import('./2025/09/hacktoberfest-2025/hacktoberfest-2025-page.component').then(
        (c) => c.Hacktoberfest2025PageComponent
      ),
    title: 'Hacktoberfest 2025'
  },
  {
    canActivate: [AuthGuard],
    path: '2025/11/black-weeks-2025',
    loadComponent: () =>
      import('./2025/11/black-weeks-2025/black-weeks-2025-page.component').then(
        (c) => c.BlackWeeks2025PageComponent
      ),
    title: 'Black Weeks 2025'
  }
];
