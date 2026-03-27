import { AccountBalanceService } from '@dexfolio/api/app/account-balance/account-balance.service';
import { AccountService } from '@dexfolio/api/app/account/account.service';
import { ActivitiesModule } from '@dexfolio/api/app/activities/activities.module';
import { PortfolioCalculatorFactory } from '@dexfolio/api/app/portfolio/calculator/portfolio-calculator.factory';
import { CurrentRateService } from '@dexfolio/api/app/portfolio/current-rate.service';
import { PortfolioService } from '@dexfolio/api/app/portfolio/portfolio.service';
import { RulesService } from '@dexfolio/api/app/portfolio/rules.service';
import { RedisCacheModule } from '@dexfolio/api/app/redis-cache/redis-cache.module';
import { UserModule } from '@dexfolio/api/app/user/user.module';
import { ApiModule } from '@dexfolio/api/services/api/api.module';
import { BenchmarkModule } from '@dexfolio/api/services/benchmark/benchmark.module';
import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';
import { DataProviderModule } from '@dexfolio/api/services/data-provider/data-provider.module';
import { ExchangeRateDataModule } from '@dexfolio/api/services/exchange-rate-data/exchange-rate-data.module';
import { I18nModule } from '@dexfolio/api/services/i18n/i18n.module';
import { ImpersonationModule } from '@dexfolio/api/services/impersonation/impersonation.module';
import { MarketDataModule } from '@dexfolio/api/services/market-data/market-data.module';
import { MarketDataService } from '@dexfolio/api/services/market-data/market-data.service';
import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';
import { PropertyModule } from '@dexfolio/api/services/property/property.module';
import { PortfolioSnapshotQueueModule } from '@dexfolio/api/services/queues/portfolio-snapshot/portfolio-snapshot.module';
import { SymbolProfileModule } from '@dexfolio/api/services/symbol-profile/symbol-profile.module';

import { Module } from '@nestjs/common';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  controllers: [AiController],
  imports: [
    ActivitiesModule,
    ApiModule,
    BenchmarkModule,
    ConfigurationModule,
    DataProviderModule,
    ExchangeRateDataModule,
    I18nModule,
    ImpersonationModule,
    MarketDataModule,
    PortfolioSnapshotQueueModule,
    PrismaModule,
    PropertyModule,
    RedisCacheModule,
    SymbolProfileModule,
    UserModule
  ],
  providers: [
    AccountBalanceService,
    AccountService,
    AiService,
    CurrentRateService,
    MarketDataService,
    PortfolioCalculatorFactory,
    PortfolioService,
    RulesService
  ]
})
export class AiModule { }
