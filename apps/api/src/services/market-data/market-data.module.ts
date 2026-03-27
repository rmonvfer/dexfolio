import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';

import { Module } from '@nestjs/common';

import { MarketDataService } from './market-data.service';

@Module({
  exports: [MarketDataService],
  imports: [PrismaModule],
  providers: [MarketDataService]
})
export class MarketDataModule { }
