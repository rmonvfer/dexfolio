import { AccessModule } from '@dexfolio/api/app/access/access.module';
import { AccountBalanceService } from '@dexfolio/api/app/account-balance/account-balance.service';
import { AccountService } from '@dexfolio/api/app/account/account.service';
import { ActivitiesModule } from '@dexfolio/api/app/activities/activities.module';
import { RedisCacheModule } from '@dexfolio/api/app/redis-cache/redis-cache.module';
import { UserModule } from '@dexfolio/api/app/user/user.module';
import { PerformanceLoggingModule } from '@dexfolio/api/interceptors/performance-logging/performance-logging.module';
import { RedactValuesInResponseModule } from '@dexfolio/api/interceptors/redact-values-in-response/redact-values-in-response.module';
import { TransformDataSourceInRequestModule } from '@dexfolio/api/interceptors/transform-data-source-in-request/transform-data-source-in-request.module';
import { TransformDataSourceInResponseModule } from '@dexfolio/api/interceptors/transform-data-source-in-response/transform-data-source-in-response.module';
import { ApiModule } from '@dexfolio/api/services/api/api.module';
import { BenchmarkModule } from '@dexfolio/api/services/benchmark/benchmark.module';
import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';
import { DataProviderModule } from '@dexfolio/api/services/data-provider/data-provider.module';
import { ExchangeRateDataModule } from '@dexfolio/api/services/exchange-rate-data/exchange-rate-data.module';
import { I18nModule } from '@dexfolio/api/services/i18n/i18n.module';
import { ImpersonationModule } from '@dexfolio/api/services/impersonation/impersonation.module';
import { MarketDataModule } from '@dexfolio/api/services/market-data/market-data.module';
import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';
import { DataGatheringModule } from '@dexfolio/api/services/queues/data-gathering/data-gathering.module';
import { PortfolioSnapshotQueueModule } from '@dexfolio/api/services/queues/portfolio-snapshot/portfolio-snapshot.module';
import { SymbolProfileModule } from '@dexfolio/api/services/symbol-profile/symbol-profile.module';

import { Module } from '@nestjs/common';

import { PortfolioCalculatorFactory } from './calculator/portfolio-calculator.factory';
import { CurrentRateService } from './current-rate.service';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { RulesService } from './rules.service';

@Module({
  controllers: [PortfolioController],
  exports: [PortfolioService],
  imports: [
    AccessModule,
    ActivitiesModule,
    ApiModule,
    BenchmarkModule,
    ConfigurationModule,
    DataGatheringModule,
    DataProviderModule,
    ExchangeRateDataModule,
    I18nModule,
    ImpersonationModule,
    MarketDataModule,
    PerformanceLoggingModule,
    PortfolioSnapshotQueueModule,
    PrismaModule,
    RedactValuesInResponseModule,
    RedisCacheModule,
    SymbolProfileModule,
    TransformDataSourceInRequestModule,
    TransformDataSourceInResponseModule,
    UserModule
  ],
  providers: [
    AccountBalanceService,
    AccountService,
    CurrentRateService,
    PortfolioCalculatorFactory,
    PortfolioService,
    RulesService
  ]
})
export class PortfolioModule { }
