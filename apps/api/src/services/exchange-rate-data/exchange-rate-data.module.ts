import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';
import { DataProviderModule } from '@dexfolio/api/services/data-provider/data-provider.module';
import { ExchangeRateDataService } from '@dexfolio/api/services/exchange-rate-data/exchange-rate-data.service';
import { MarketDataModule } from '@dexfolio/api/services/market-data/market-data.module';
import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';
import { PropertyModule } from '@dexfolio/api/services/property/property.module';

import { Module } from '@nestjs/common';

@Module({
  exports: [ExchangeRateDataService],
  imports: [
    ConfigurationModule,
    DataProviderModule,
    MarketDataModule,
    PrismaModule,
    PropertyModule
  ],
  providers: [ExchangeRateDataService]
})
export class ExchangeRateDataModule { }
