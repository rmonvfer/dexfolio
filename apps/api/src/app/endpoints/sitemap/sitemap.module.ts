import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';
import { I18nModule } from '@dexfolio/api/services/i18n/i18n.module';

import { Module } from '@nestjs/common';

import { SitemapController } from './sitemap.controller';
import { SitemapService } from './sitemap.service';

@Module({
  controllers: [SitemapController],
  imports: [ConfigurationModule, I18nModule],
  providers: [SitemapService]
})
export class SitemapModule { }
