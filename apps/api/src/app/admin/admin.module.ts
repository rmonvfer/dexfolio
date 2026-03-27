import { ActivitiesModule } from '@dexfolio/api/app/activities/activities.module';
import { TransformDataSourceInRequestModule } from '@dexfolio/api/interceptors/transform-data-source-in-request/transform-data-source-in-request.module';
import { ApiModule } from '@dexfolio/api/services/api/api.module';
import { BenchmarkModule } from '@dexfolio/api/services/benchmark/benchmark.module';
import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';
import { DataProviderModule } from '@dexfolio/api/services/data-provider/data-provider.module';
import { DemoModule } from '@dexfolio/api/services/demo/demo.module';
import { ExchangeRateDataModule } from '@dexfolio/api/services/exchange-rate-data/exchange-rate-data.module';
import { MarketDataModule } from '@dexfolio/api/services/market-data/market-data.module';
import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';
import { PropertyModule } from '@dexfolio/api/services/property/property.module';
import { DataGatheringModule } from '@dexfolio/api/services/queues/data-gathering/data-gathering.module';
import { SymbolProfileModule } from '@dexfolio/api/services/symbol-profile/symbol-profile.module';

import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ActivitiesModule,
    ApiModule,
    BenchmarkModule,
    ConfigurationModule,
    DataGatheringModule,
    DataProviderModule,
    DemoModule,
    ExchangeRateDataModule,
    MarketDataModule,
    PrismaModule,
    PropertyModule,
    QueueModule,
    SymbolProfileModule,
    TransformDataSourceInRequestModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
})
export class AdminModule { }
