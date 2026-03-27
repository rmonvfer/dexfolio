import { RedisCacheModule } from '@dexfolio/api/app/redis-cache/redis-cache.module';
import { DataProviderModule } from '@dexfolio/api/services/data-provider/data-provider.module';
import { MarketDataModule } from '@dexfolio/api/services/market-data/market-data.module';
import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';
import { PropertyModule } from '@dexfolio/api/services/property/property.module';
import { SymbolProfileModule } from '@dexfolio/api/services/symbol-profile/symbol-profile.module';

import { Module } from '@nestjs/common';

import { BenchmarkService } from './benchmark.service';

@Module({
  exports: [BenchmarkService],
  imports: [
    DataProviderModule,
    MarketDataModule,
    PrismaModule,
    PropertyModule,
    RedisCacheModule,
    SymbolProfileModule
  ],
  providers: [BenchmarkService]
})
export class BenchmarkModule { }
