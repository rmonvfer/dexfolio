import { RedisCacheModule } from '@dexfolio/api/app/redis-cache/redis-cache.module';
import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';
import { CryptocurrencyModule } from '@dexfolio/api/services/cryptocurrency/cryptocurrency.module';
import { AlphaVantageService } from '@dexfolio/api/services/data-provider/alpha-vantage/alpha-vantage.service';
import { CoinGeckoService } from '@dexfolio/api/services/data-provider/coingecko/coingecko.service';
import { EodHistoricalDataService } from '@dexfolio/api/services/data-provider/eod-historical-data/eod-historical-data.service';
import { FinancialModelingPrepService } from '@dexfolio/api/services/data-provider/financial-modeling-prep/financial-modeling-prep.service';
import { DexfolioService } from '@dexfolio/api/services/data-provider/dexfolio/dexfolio.service';
import { GoogleSheetsService } from '@dexfolio/api/services/data-provider/google-sheets/google-sheets.service';
import { ManualService } from '@dexfolio/api/services/data-provider/manual/manual.service';
import { RapidApiService } from '@dexfolio/api/services/data-provider/rapid-api/rapid-api.service';
import { YahooFinanceService } from '@dexfolio/api/services/data-provider/yahoo-finance/yahoo-finance.service';
import { MarketDataModule } from '@dexfolio/api/services/market-data/market-data.module';
import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';
import { PropertyModule } from '@dexfolio/api/services/property/property.module';
import { SymbolProfileModule } from '@dexfolio/api/services/symbol-profile/symbol-profile.module';

import { Module } from '@nestjs/common';

import { DataEnhancerModule } from './data-enhancer/data-enhancer.module';
import { YahooFinanceDataEnhancerService } from './data-enhancer/yahoo-finance/yahoo-finance.service';
import { DataProviderService } from './data-provider.service';

@Module({
  imports: [
    ConfigurationModule,
    CryptocurrencyModule,
    DataEnhancerModule,
    MarketDataModule,
    PrismaModule,
    PropertyModule,
    RedisCacheModule,
    SymbolProfileModule
  ],
  providers: [
    AlphaVantageService,
    CoinGeckoService,
    DataProviderService,
    EodHistoricalDataService,
    FinancialModelingPrepService,
    DexfolioService,
    GoogleSheetsService,
    ManualService,
    RapidApiService,
    YahooFinanceService,
    {
      inject: [
        AlphaVantageService,
        CoinGeckoService,
        EodHistoricalDataService,
        FinancialModelingPrepService,
        DexfolioService,
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
        DexfolioService,
        googleSheetsService,
        manualService,
        rapidApiService,
        yahooFinanceService
      ) => [
          alphaVantageService,
          coinGeckoService,
          eodHistoricalDataService,
          financialModelingPrepService,
          DexfolioService,
          googleSheetsService,
          manualService,
          rapidApiService,
          yahooFinanceService
        ]
    },
    YahooFinanceDataEnhancerService
  ],
  exports: [DataProviderService, ManualService, YahooFinanceService]
})
export class DataProviderModule { }
