import { AccountModule } from '@dexfolio/api/app/account/account.module';
import { ActivitiesModule } from '@dexfolio/api/app/activities/activities.module';
import { CacheModule } from '@dexfolio/api/app/cache/cache.module';
import { PlatformModule } from '@dexfolio/api/app/platform/platform.module';
import { PortfolioModule } from '@dexfolio/api/app/portfolio/portfolio.module';
import { RedisCacheModule } from '@dexfolio/api/app/redis-cache/redis-cache.module';
import { TransformDataSourceInRequestModule } from '@dexfolio/api/interceptors/transform-data-source-in-request/transform-data-source-in-request.module';
import { TransformDataSourceInResponseModule } from '@dexfolio/api/interceptors/transform-data-source-in-response/transform-data-source-in-response.module';
import { ApiModule } from '@dexfolio/api/services/api/api.module';
import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';
import { DataProviderModule } from '@dexfolio/api/services/data-provider/data-provider.module';
import { ExchangeRateDataModule } from '@dexfolio/api/services/exchange-rate-data/exchange-rate-data.module';
import { MarketDataModule } from '@dexfolio/api/services/market-data/market-data.module';
import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';
import { DataGatheringModule } from '@dexfolio/api/services/queues/data-gathering/data-gathering.module';
import { SymbolProfileModule } from '@dexfolio/api/services/symbol-profile/symbol-profile.module';
import { TagModule } from '@dexfolio/api/services/tag/tag.module';

import { Module } from '@nestjs/common';

import { ImportController } from './import.controller';
import { ImportService } from './import.service';

@Module({
  controllers: [ImportController],
  imports: [
    AccountModule,
    ActivitiesModule,
    ApiModule,
    CacheModule,
    ConfigurationModule,
    DataGatheringModule,
    DataProviderModule,
    ExchangeRateDataModule,
    MarketDataModule,
    PlatformModule,
    PortfolioModule,
    PrismaModule,
    RedisCacheModule,
    SymbolProfileModule,
    TagModule,
    TransformDataSourceInRequestModule,
    TransformDataSourceInResponseModule
  ],
  providers: [ImportService]
})
export class ImportModule { }
