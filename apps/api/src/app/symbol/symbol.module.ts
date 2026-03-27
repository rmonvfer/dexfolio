import { TransformDataSourceInRequestModule } from '@dexfolio/api/interceptors/transform-data-source-in-request/transform-data-source-in-request.module';
import { TransformDataSourceInResponseModule } from '@dexfolio/api/interceptors/transform-data-source-in-response/transform-data-source-in-response.module';
import { DataProviderModule } from '@dexfolio/api/services/data-provider/data-provider.module';
import { MarketDataModule } from '@dexfolio/api/services/market-data/market-data.module';
import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';

import { Module } from '@nestjs/common';

import { SymbolController } from './symbol.controller';
import { SymbolService } from './symbol.service';

@Module({
  controllers: [SymbolController],
  exports: [SymbolService],
  imports: [
    DataProviderModule,
    MarketDataModule,
    PrismaModule,
    TransformDataSourceInRequestModule,
    TransformDataSourceInResponseModule
  ],
  providers: [SymbolService]
})
export class SymbolModule { }
