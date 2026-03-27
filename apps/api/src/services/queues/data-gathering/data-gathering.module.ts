import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';
import { DataEnhancerModule } from '@dexfolio/api/services/data-provider/data-enhancer/data-enhancer.module';
import { DataProviderModule } from '@dexfolio/api/services/data-provider/data-provider.module';
import { ExchangeRateDataModule } from '@dexfolio/api/services/exchange-rate-data/exchange-rate-data.module';
import { MarketDataModule } from '@dexfolio/api/services/market-data/market-data.module';
import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';
import { PropertyModule } from '@dexfolio/api/services/property/property.module';
import { DataGatheringService } from '@dexfolio/api/services/queues/data-gathering/data-gathering.service';
import { SymbolProfileModule } from '@dexfolio/api/services/symbol-profile/symbol-profile.module';
import { DATA_GATHERING_QUEUE } from '@dexfolio/common/config';

import { BullAdapter } from '@bull-board/api/bullAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import ms from 'ms';

import { DataGatheringProcessor } from './data-gathering.processor';

@Module({
  imports: [
    ...(process.env.ENABLE_FEATURE_BULL_BOARD === 'true'
      ? [
        BullBoardModule.forFeature({
          adapter: BullAdapter,
          name: DATA_GATHERING_QUEUE,
          options: {
            displayName: 'Data Gathering',
            readOnlyMode: process.env.BULL_BOARD_IS_READ_ONLY !== 'false'
          }
        })
      ]
      : []),
    BullModule.registerQueue({
      limiter: {
        duration: ms('4 seconds'),
        max: 1
      },
      name: DATA_GATHERING_QUEUE
    }),
    ConfigurationModule,
    DataEnhancerModule,
    DataProviderModule,
    ExchangeRateDataModule,
    MarketDataModule,
    PrismaModule,
    PropertyModule,
    SymbolProfileModule
  ],
  providers: [DataGatheringProcessor, DataGatheringService],
  exports: [BullModule, DataEnhancerModule, DataGatheringService]
})
export class DataGatheringModule { }
