import { AccountBalanceService } from '@dexfolio/api/app/account-balance/account-balance.service';
import { AccountService } from '@dexfolio/api/app/account/account.service';
import { CacheModule } from '@dexfolio/api/app/cache/cache.module';
import { RedisCacheModule } from '@dexfolio/api/app/redis-cache/redis-cache.module';
import { RedactValuesInResponseModule } from '@dexfolio/api/interceptors/redact-values-in-response/redact-values-in-response.module';
import { TransformDataSourceInRequestModule } from '@dexfolio/api/interceptors/transform-data-source-in-request/transform-data-source-in-request.module';
import { TransformDataSourceInResponseModule } from '@dexfolio/api/interceptors/transform-data-source-in-response/transform-data-source-in-response.module';
import { ApiModule } from '@dexfolio/api/services/api/api.module';
import { DataProviderModule } from '@dexfolio/api/services/data-provider/data-provider.module';
import { ExchangeRateDataModule } from '@dexfolio/api/services/exchange-rate-data/exchange-rate-data.module';
import { ImpersonationModule } from '@dexfolio/api/services/impersonation/impersonation.module';
import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';
import { DataGatheringModule } from '@dexfolio/api/services/queues/data-gathering/data-gathering.module';
import { SymbolProfileModule } from '@dexfolio/api/services/symbol-profile/symbol-profile.module';

import { Module } from '@nestjs/common';

import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';

@Module({
  controllers: [ActivitiesController],
  exports: [ActivitiesService],
  imports: [
    ApiModule,
    CacheModule,
    DataGatheringModule,
    DataProviderModule,
    ExchangeRateDataModule,
    ImpersonationModule,
    PrismaModule,
    RedactValuesInResponseModule,
    RedisCacheModule,
    SymbolProfileModule,
    TransformDataSourceInRequestModule,
    TransformDataSourceInResponseModule
  ],
  providers: [AccountBalanceService, AccountService, ActivitiesService]
})
export class ActivitiesModule { }
