import { environment } from '@dexfolio/api/environments/environment';
import { I18nService } from '@dexfolio/api/services/i18n/i18n.service';
import {
  DEFAULT_LANGUAGE_CODE,
  STORYBOOK_PATH,
  SUPPORTED_LANGUAGE_CODES
} from '@dexfolio/common/config';
import { DATE_FORMAT, interpolate } from '@dexfolio/common/helper';

import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { format } from 'date-fns';
import { NextFunction, Request, Response } from 'express';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const title = 'DEXFOLIO';

const locales = {
  '/de/blog/2023/01/dexfolio-auf-sackgeld-vorgestellt': {
    featureGraphicPath: 'assets/images/blog/dexfolio-x-sackgeld.png',
    title: `dexfolio auf Sackgeld.com vorgestellt - ${title}`
  },
  '/en/blog/2022/08/500-stars-on-github': {
    featureGraphicPath: 'assets/images/blog/500-stars-on-github.jpg',
    title: `500 Stars - ${title}`
  },
  '/en/blog/2022/10/hacktoberfest-2022': {
    featureGraphicPath: 'assets/images/blog/hacktoberfest-2022.png',
    title: `Hacktoberfest 2022 - ${title}`
  },
  '/en/blog/2022/12/the-importance-of-tracking-your-personal-finances': {
    featureGraphicPath: 'assets/images/blog/20221226.jpg',
    title: `The importance of tracking your personal finances - ${title}`
  },
  '/en/blog/2023/02/dexfolio-meets-umbrel': {
    featureGraphicPath: 'assets/images/blog/dexfolio-x-umbrel.png',
    title: `dexfolio meets Umbrel - ${title}`
  },
  '/en/blog/2023/03/dexfolio-reaches-1000-stars-on-github': {
    featureGraphicPath: 'assets/images/blog/1000-stars-on-github.jpg',
    title: `dexfolio reaches 1’000 Stars on GitHub - ${title}`
  },
  '/en/blog/2023/05/unlock-your-financial-potential-with-dexfolio': {
    featureGraphicPath: 'assets/images/blog/20230520.jpg',
    title: `Unlock your Financial Potential with dexfolio - ${title}`
  },
  '/en/blog/2023/07/exploring-the-path-to-fire': {
    featureGraphicPath: 'assets/images/blog/20230701.jpg',
    title: `Exploring the Path to FIRE - ${title}`
  },
  '/en/blog/2023/08/dexfolio-joins-oss-friends': {
    featureGraphicPath: 'assets/images/blog/dexfolio-joins-oss-friends.png',
    title: `dexfolio joins OSS Friends - ${title}`
  },
  '/en/blog/2023/09/dexfolio-2': {
    featureGraphicPath: 'assets/images/blog/dexfolio-2.jpg',
    title: `Announcing dexfolio 2.0 - ${title}`
  },
  '/en/blog/2023/09/hacktoberfest-2023': {
    featureGraphicPath: 'assets/images/blog/hacktoberfest-2023.png',
    title: `Hacktoberfest 2023 - ${title}`
  },
  '/en/blog/2023/11/black-week-2023': {
    featureGraphicPath: 'assets/images/blog/black-week-2023.jpg',
    title: `Black Week 2023 - ${title}`
  },
  '/en/blog/2023/11/hacktoberfest-2023-debriefing': {
    featureGraphicPath: 'assets/images/blog/hacktoberfest-2023.png',
    title: `Hacktoberfest 2023 Debriefing - ${title}`
  },
  '/en/blog/2024/09/hacktoberfest-2024': {
    featureGraphicPath: 'assets/images/blog/hacktoberfest-2024.png',
    title: `Hacktoberfest 2024 - ${title}`
  },
  '/en/blog/2024/11/black-weeks-2024': {
    featureGraphicPath: 'assets/images/blog/black-weeks-2024.jpg',
    title: `Black Weeks 2024 - ${title}`
  },
  '/en/blog/2025/09/hacktoberfest-2025': {
    featureGraphicPath: 'assets/images/blog/hacktoberfest-2025.png',
    title: `Hacktoberfest 2025 - ${title}`
  },
  '/en/blog/2025/11/black-weeks-2025': {
    featureGraphicPath: 'assets/images/blog/black-weeks-2025.jpg',
    title: `Black Weeks 2025 - ${title}`
  }
};

@Injectable()
export class HtmlTemplateMiddleware implements NestMiddleware {
  private indexHtmlMap: { [languageCode: string]: string } = {};

  public constructor(private readonly i18nService: I18nService) {
    try {
      this.indexHtmlMap = SUPPORTED_LANGUAGE_CODES.reduce(
        (map, languageCode) => ({
          ...map,
          [languageCode]: readFileSync(
            join(__dirname, '..', 'client', languageCode, 'index.html'),
            'utf8'
          )
        }),
        {}
      );
    } catch (error) {
      Logger.error(
        'Failed to initialize index HTML map',
        error,
        'HTMLTemplateMiddleware'
      );
    }
  }

  public use(request: Request, response: Response, next: NextFunction) {
    const path = request.originalUrl.replace(/\/$/, '');
    let languageCode = path.substr(1, 2);

    if (!SUPPORTED_LANGUAGE_CODES.includes(languageCode)) {
      languageCode = DEFAULT_LANGUAGE_CODE;
    }

    const currentDate = format(new Date(), DATE_FORMAT);
    const rootUrl = process.env.ROOT_URL || environment.rootUrl;

    if (
      path.startsWith('/api/') ||
      path.startsWith(STORYBOOK_PATH) ||
      this.isFileRequest(path) ||
      !environment.production
    ) {
      // Skip
      next();
    } else {
      const indexHtml = interpolate(this.indexHtmlMap[languageCode], {
        currentDate,
        languageCode,
        path,
        rootUrl,
        description: this.i18nService.getTranslation({
          languageCode,
          id: 'metaDescription'
        }),
        featureGraphicPath:
          locales[path]?.featureGraphicPath ?? 'assets/cover.png',
        keywords: this.i18nService.getTranslation({
          languageCode,
          id: 'metaKeywords'
        }),
        title:
          locales[path]?.title ??
          `${title} – ${this.i18nService.getTranslation({
            languageCode,
            id: 'slogan'
          })}`
      });

      return response.send(indexHtml);
    }
  }

  private isFileRequest(filename: string) {
    if (filename === '/assets/LICENSE') {
      return true;
    } else if (
      filename.endsWith('-de.fi') ||
      filename.endsWith('-markets.sh') ||
      filename.includes('auth/ey')
    ) {
      return false;
    }

    return filename.split('.').pop() !== filename;
  }
}
