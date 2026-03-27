import { AccountBalanceModule } from '@dexfolio/api/app/account-balance/account-balance.module';
import { ActivitiesModule } from '@dexfolio/api/app/activities/activities.module';
import { PortfolioCalculatorFactory } from '@dexfolio/api/app/portfolio/calculator/portfolio-calculator.factory';
import { CurrentRateService } from '@dexfolio/api/app/portfolio/current-rate.service';
import { RedisCacheModule } from '@dexfolio/api/app/redis-cache/redis-cache.module';
import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';
import { DataProviderModule } from '@dexfolio/api/services/data-provider/data-provider.module';
import { ExchangeRateDataModule } from '@dexfolio/api/services/exchange-rate-data/exchange-rate-data.module';
import { MarketDataModule } from '@dexfolio/api/services/market-data/market-data.module';
import { PortfolioSnapshotService } from '@dexfolio/api/services/queues/portfolio-snapshot/portfolio-snapshot.service';
import {
  DEFAULT_PROCESSOR_PORTFOLIO_SNAPSHOT_COMPUTATION_TIMEOUT,
  PORTFOLIO_SNAPSHOT_COMPUTATION_QUEUE
} from '@dexfolio/common/config';

import { BullAdapter } from '@bull-board/api/bullAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { PortfolioSnapshotProcessor } from './portfolio-snapshot.processor';

@Module({
  exports: [BullModule, PortfolioSnapshotService],
  imports: [
    AccountBalanceModule,
    ActivitiesModule,
    ...(process.env.ENABLE_FEATURE_BULL_BOARD === 'true'
      ? [
        BullBoardModule.forFeature({
          adapter: BullAdapter,
          name: PORTFOLIO_SNAPSHOT_COMPUTATION_QUEUE,
          options: {
            displayName: 'Portfolio Snapshot Computation',
            readOnlyMode: process.env.BULL_BOARD_IS_READ_ONLY !== 'false'
          }
        })
      ]
      : []),
    BullModule.registerQueue({
      name: PORTFOLIO_SNAPSHOT_COMPUTATION_QUEUE,
      settings: {
        lockDuration: parseInt(
          process.env.PROCESSOR_PORTFOLIO_SNAPSHOT_COMPUTATION_TIMEOUT ??
          DEFAULT_PROCESSOR_PORTFOLIO_SNAPSHOT_COMPUTATION_TIMEOUT.toString(),
          10
        )
      }
    }),
    ConfigurationModule,
    DataProviderModule,
    ExchangeRateDataModule,
    MarketDataModule,
    RedisCacheModule
  ],
  providers: [
    CurrentRateService,
    PortfolioCalculatorFactory,
    PortfolioSnapshotProcessor,
    PortfolioSnapshotService
  ]
})
export class PortfolioSnapshotQueueModule { }
