import { RedisCacheModule } from '@dexfolio/api/app/redis-cache/redis-cache.module';
import { ConfigurationService } from '@dexfolio/api/services/configuration/configuration.service';
import { CryptocurrencyModule } from '@dexfolio/api/services/cryptocurrency/cryptocurrency.module';
import { AlphaVantageService } from '@dexfolio/api/services/data-provider/alpha-vantage/alpha-vantage.service';
import { CoinGeckoService } from '@dexfolio/api/services/data-provider/coingecko/coingecko.service';
import { YahooFinanceDataEnhancerService } from '@dexfolio/api/services/data-provider/data-enhancer/yahoo-finance/yahoo-finance.service';
import { DataProviderModule } from '@dexfolio/api/services/data-provider/data-provider.module';
import { DataProviderService } from '@dexfolio/api/services/data-provider/data-provider.service';
import { EodHistoricalDataService } from '@dexfolio/api/services/data-provider/eod-historical-data/eod-historical-data.service';
import { FinancialModelingPrepService } from '@dexfolio/api/services/data-provider/financial-modeling-prep/financial-modeling-prep.service';
import { GoogleSheetsService } from '@dexfolio/api/services/data-provider/google-sheets/google-sheets.service';
import { ManualService } from '@dexfolio/api/services/data-provider/manual/manual.service';
import { RapidApiService } from '@dexfolio/api/services/data-provider/rapid-api/rapid-api.service';
import { YahooFinanceService } from '@dexfolio/api/services/data-provider/yahoo-finance/yahoo-finance.service';
import { MarketDataModule } from '@dexfolio/api/services/market-data/market-data.module';
import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';
import { PropertyModule } from '@dexfolio/api/services/property/property.module';
import { SymbolProfileModule } from '@dexfolio/api/services/symbol-profile/symbol-profile.module';

import { Module } from '@nestjs/common';

import { DexfolioController } from './dexfolio.controller';
import { DexfolioService } from './dexfolio.service';

@Module({
  controllers: [DexfolioController],
  imports: [
    CryptocurrencyModule,
    DataProviderModule,
    MarketDataModule,
    PrismaModule,
    PropertyModule,
    RedisCacheModule,
    SymbolProfileModule
  ],
  providers: [
    AlphaVantageService,
    CoinGeckoService,
    ConfigurationService,
    DataProviderService,
    EodHistoricalDataService,
    FinancialModelingPrepService,
    DexfolioService,
    GoogleSheetsService,
    ManualService,
    RapidApiService,
    YahooFinanceService,
    YahooFinanceDataEnhancerService,
    {
      inject: [
        AlphaVantageService,
        CoinGeckoService,
        EodHistoricalDataService,
        FinancialModelingPrepService,
        GoogleSheetsService,
        ManualService,
        RapidApiService,
        YahooFinanceService
      ],
      provide: 'DataProviderInterfaces',
      useFactory: (
        alphaVantageService,
        coinGeckoService,
        eodHistoricalDataService,
        financialModelingPrepService,
        googleSheetsService,
        manualService,
        rapidApiService,
        yahooFinanceService
      ) => [
          alphaVantageService,
          coinGeckoService,
          eodHistoricalDataService,
          financialModelingPrepService,
          googleSheetsService,
          manualService,
          rapidApiService,
          yahooFinanceService
        ]
    }
  ]
})
export class DexfolioModule { }
