import { TransformDataSourceInRequestModule } from '@dexfolio/api/interceptors/transform-data-source-in-request/transform-data-source-in-request.module';
import { TransformDataSourceInResponseModule } from '@dexfolio/api/interceptors/transform-data-source-in-response/transform-data-source-in-response.module';
import { BenchmarkModule } from '@dexfolio/api/services/benchmark/benchmark.module';
import { DataProviderModule } from '@dexfolio/api/services/data-provider/data-provider.module';
import { ImpersonationModule } from '@dexfolio/api/services/impersonation/impersonation.module';
import { MarketDataModule } from '@dexfolio/api/services/market-data/market-data.module';
import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';
import { DataGatheringModule } from '@dexfolio/api/services/queues/data-gathering/data-gathering.module';
import { SymbolProfileModule } from '@dexfolio/api/services/symbol-profile/symbol-profile.module';

import { Module } from '@nestjs/common';

import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';

@Module({
  controllers: [WatchlistController],
  imports: [
    BenchmarkModule,
    DataGatheringModule,
    DataProviderModule,
    ImpersonationModule,
    MarketDataModule,
    PrismaModule,
    SymbolProfileModule,
    TransformDataSourceInRequestModule,
    TransformDataSourceInResponseModule
  ],
  providers: [WatchlistService]
})
export class WatchlistModule { }
