import { ConfigurationService } from '@dexfolio/api/services/configuration/configuration.service';
import { I18nService } from '@dexfolio/api/services/i18n/i18n.service';
import { SUPPORTED_LANGUAGE_CODES } from '@dexfolio/common/config';
import { personalFinanceTools } from '@dexfolio/common/personal-finance-tools';
import { PublicRoute } from '@dexfolio/common/routes/interfaces/public-route.interface';
import { publicRoutes } from '@dexfolio/common/routes/routes';

import { Injectable } from '@nestjs/common';

@Injectable()
export class SitemapService {
  private static readonly TRANSLATION_TAGGED_MESSAGE_REGEX =
    /:.*@@(?<id>[a-zA-Z0-9.]+):(?<message>.+)/;

  public constructor(
    private readonly configurationService: ConfigurationService,
    private readonly i18nService: I18nService
  ) { }

  public getBlogPosts({ currentDate }: { currentDate: string }) {
    const rootUrl = this.configurationService.get('ROOT_URL');

    return [
      {
        languageCode: 'de',
        routerLink: ['2021', '07', 'hallo-dexfolio']
      },
      {
        languageCode: 'en',
        routerLink: ['2021', '07', 'hello-dexfolio']
      },
      {
        languageCode: 'en',
        routerLink: ['2022', '01', 'dexfolio-first-months-in-open-source']
      },
      {
        languageCode: 'en',
        routerLink: ['2022', '07', 'dexfolio-meets-internet-identity']
      },
      {
        languageCode: 'en',
        routerLink: ['2022', '07', 'how-do-i-get-my-finances-in-order']
      },
      {
        languageCode: 'en',
        routerLink: ['2022', '08', '500-stars-on-github']
      },
      {
        languageCode: 'en',
        routerLink: ['2022', '10', 'hacktoberfest-2022']
      },
      {
        languageCode: 'en',
        routerLink: ['2022', '11', 'black-friday-2022']
      },
      {
        languageCode: 'en',
        routerLink: [
          '2022',
          '12',
          'the-importance-of-tracking-your-personal-finances'
        ]
      },
      {
        languageCode: 'de',
        routerLink: ['2023', '01', 'dexfolio-auf-sackgeld-vorgestellt']
      },
      {
        languageCode: 'en',
        routerLink: ['2023', '02', 'dexfolio-meets-umbrel']
      },
      {
        languageCode: 'en',
        routerLink: ['2023', '03', 'dexfolio-reaches-1000-stars-on-github']
      },
      {
        languageCode: 'en',
        routerLink: [
          '2023',
          '05',
          'unlock-your-financial-potential-with-dexfolio'
        ]
      },
      {
        languageCode: 'en',
        routerLink: ['2023', '07', 'exploring-the-path-to-fire']
      },
      {
        languageCode: 'en',
        routerLink: ['2023', '08', 'dexfolio-joins-oss-friends']
      },
      {
        languageCode: 'en',
        routerLink: ['2023', '09', 'dexfolio-2']
      },
      {
        languageCode: 'en',
        routerLink: ['2023', '09', 'hacktoberfest-2023']
      },
      {
        languageCode: 'en',
        routerLink: ['2023', '11', 'black-week-2023']
      },
      {
        languageCode: 'en',
        routerLink: ['2023', '11', 'hacktoberfest-2023-debriefing']
      },
      {
        languageCode: 'en',
        routerLink: ['2024', '09', 'hacktoberfest-2024']
      },
      {
        languageCode: 'en',
        routerLink: ['2024', '11', 'black-weeks-2024']
      },
      {
        languageCode: 'en',
        routerLink: ['2025', '09', 'hacktoberfest-2025']
      },
      {
        languageCode: 'en',
        routerLink: ['2025', '11', 'black-weeks-2025']
      }
    ]
      .map(({ languageCode, routerLink }) => {
        return this.createRouteSitemapUrl({
          currentDate,
          languageCode,
          rootUrl,
          route: {
            routerLink: [publicRoutes.blog.path, ...routerLink],
            path: undefined
          }
        });
      })
      .join('\n');
  }

  public getPersonalFinanceTools({ currentDate }: { currentDate: string }) {
    const rootUrl = this.configurationService.get('ROOT_URL');

    return SUPPORTED_LANGUAGE_CODES.flatMap((languageCode) => {
      const resourcesPath = this.i18nService.getTranslation({
        languageCode,
        id: publicRoutes.resources.path.match(
          SitemapService.TRANSLATION_TAGGED_MESSAGE_REGEX
        ).groups.id
      });

      const personalFinanceToolsPath = this.i18nService.getTranslation({
        languageCode,
        id: publicRoutes.resources.subRoutes.personalFinanceTools.path.match(
          SitemapService.TRANSLATION_TAGGED_MESSAGE_REGEX
        ).groups.id
      });

      const productPath = this.i18nService.getTranslation({
        languageCode,
        id: publicRoutes.resources.subRoutes.personalFinanceTools.subRoutes.product.path.match(
          SitemapService.TRANSLATION_TAGGED_MESSAGE_REGEX
        ).groups.id
      });

      return personalFinanceTools.map(({ alias, key }) => {
        const routerLink = [
          resourcesPath,
          personalFinanceToolsPath,
          `${productPath}-${alias ?? key}`
        ];

        return this.createRouteSitemapUrl({
          currentDate,
          languageCode,
          rootUrl,
          route: {
            routerLink,
            path: undefined
          }
        });
      });
    }).join('\n');
  }

  public getPublicRoutes({ currentDate }: { currentDate: string }) {
    const rootUrl = this.configurationService.get('ROOT_URL');

    return SUPPORTED_LANGUAGE_CODES.flatMap((languageCode) => {
      const params = {
        currentDate,
        languageCode,
        rootUrl
      };

      return [
        this.createRouteSitemapUrl(params),
        ...this.createSitemapUrls(params, publicRoutes)
      ];
    }).join('\n');
  }

  private createRouteSitemapUrl({
    currentDate,
    languageCode,
    rootUrl,
    route
  }: {
    currentDate: string;
    languageCode: string;
    rootUrl: string;
    route?: PublicRoute;
  }): string {
    const segments =
      route?.routerLink.map((link) => {
        const match = link.match(
          SitemapService.TRANSLATION_TAGGED_MESSAGE_REGEX
        );

        const segment = match
          ? (this.i18nService.getTranslation({
            languageCode,
            id: match.groups.id
          }) ?? match.groups.message)
          : link;

        return segment.replace(/^\/+|\/+$/, '');
      }) ?? [];

    const location = [rootUrl, languageCode, ...segments].join('/');

    return [
      '  <url>',
      `    <loc>${location}</loc>`,
      `    <lastmod>${currentDate}T00:00:00+00:00</lastmod>`,
      '  </url>'
    ].join('\n');
  }

  private createSitemapUrls(
    params: { currentDate: string; languageCode: string; rootUrl: string },
    routes: Record<string, PublicRoute>
  ): string[] {
    return Object.values(routes).flatMap((route) => {
      if (route.excludeFromSitemap) {
        return [];
      }

      const urls = [this.createRouteSitemapUrl({ ...params, route })];

      if (route.subRoutes) {
        urls.push(...this.createSitemapUrls(params, route.subRoutes));
      }

      return urls;
    });
  }
}
