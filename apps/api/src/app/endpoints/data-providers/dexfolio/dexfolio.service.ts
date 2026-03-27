import { ConfigurationService } from '@dexfolio/api/services/configuration/configuration.service';
import { DataProviderService } from '@dexfolio/api/services/data-provider/data-provider.service';
import { DexfolioService as DexfolioDataProviderService } from '@dexfolio/api/services/data-provider/dexfolio/dexfolio.service';
import {
  GetAssetProfileParams,
  GetDividendsParams,
  GetHistoricalParams,
  GetQuotesParams,
  GetSearchParams
} from '@dexfolio/api/services/data-provider/interfaces/data-provider.interface';
import { PrismaService } from '@dexfolio/api/services/prisma/prisma.service';
import { PropertyService } from '@dexfolio/api/services/property/property.service';
import {
  DEFAULT_CURRENCY,
  DERIVED_CURRENCIES
} from '@dexfolio/common/config';
import { PROPERTY_DATA_SOURCES_dexfolio_DATA_PROVIDER_MAX_REQUESTS } from '@dexfolio/common/config';
import {
  DataProviderDexfolioAssetProfileResponse,
  DataProviderHistoricalResponse,
  DataProviderInfo,
  DividendsResponse,
  HistoricalResponse,
  LookupItem,
  LookupResponse,
  QuotesResponse
} from '@dexfolio/common/interfaces';
import { UserWithSettings } from '@dexfolio/common/types';

import { Injectable, Logger } from '@nestjs/common';
import { DataSource, SymbolProfile } from '@prisma/client';
import { Big } from 'big.js';

@Injectable()
export class DexfolioService {
  public constructor(
    private readonly configurationService: ConfigurationService,
    private readonly dataProviderService: DataProviderService,
    private readonly prismaService: PrismaService,
    private readonly propertyService: PropertyService
  ) { }

  public async getAssetProfile({ symbol }: GetAssetProfileParams) {
    let result: DataProviderDexfolioAssetProfileResponse = {};

    try {
      const promises: Promise<Partial<SymbolProfile>>[] = [];

      for (const dataProviderService of this.getDataProviderServices()) {
        promises.push(
          this.dataProviderService
            .getAssetProfiles([
              {
                symbol,
                dataSource: dataProviderService.getName()
              }
            ])
            .then(async (assetProfiles) => {
              const assetProfile = assetProfiles[symbol];
              const dataSourceOrigin = DataSource.DEXFOLIO;

              if (assetProfile) {
                await this.prismaService.assetProfileResolution.upsert({
                  create: {
                    dataSourceOrigin,
                    currency: assetProfile.currency,
                    dataSourceTarget: assetProfile.dataSource,
                    symbolOrigin: symbol,
                    symbolTarget: assetProfile.symbol
                  },
                  update: {
                    requestCount: {
                      increment: 1
                    }
                  },
                  where: {
                    dataSourceOrigin_symbolOrigin: {
                      dataSourceOrigin,
                      symbolOrigin: symbol
                    }
                  }
                });
              }

              result = {
                ...result,
                ...assetProfile,
                dataSource: dataSourceOrigin
              };

              return assetProfile;
            })
        );
      }

      await Promise.all(promises);

      return result;
    } catch (error) {
      Logger.error(error, 'DexfolioService');

      throw error;
    }
  }

  public async getDividends({
    from,
    granularity,
    requestTimeout = this.configurationService.get('REQUEST_TIMEOUT'),
    symbol,
    to
  }: GetDividendsParams) {
    const result: DividendsResponse = { dividends: {} };

    try {
      const promises: Promise<{
        [date: string]: DataProviderHistoricalResponse;
      }>[] = [];

      for (const dataProviderService of this.getDataProviderServices()) {
        promises.push(
          dataProviderService
            .getDividends({
              from,
              granularity,
              requestTimeout,
              symbol,
              to
            })
            .then((dividends) => {
              result.dividends = dividends;

              return dividends;
            })
        );
      }

      await Promise.all(promises);

      return result;
    } catch (error) {
      Logger.error(error, 'DexfolioService');

      throw error;
    }
  }

  public async getHistorical({
    from,
    granularity,
    requestTimeout,
    to,
    symbol
  }: GetHistoricalParams) {
    const result: HistoricalResponse = { historicalData: {} };

    try {
      const promises: Promise<{
        [symbol: string]: { [date: string]: DataProviderHistoricalResponse };
      }>[] = [];

      for (const dataProviderService of this.getDataProviderServices()) {
        promises.push(
          dataProviderService
            .getHistorical({
              from,
              granularity,
              requestTimeout,
              symbol,
              to
            })
            .then((historicalData) => {
              result.historicalData = historicalData[symbol];

              return historicalData;
            })
        );
      }

      await Promise.all(promises);

      return result;
    } catch (error) {
      Logger.error(error, 'DexfolioService');

      throw error;
    }
  }

  public async getMaxDailyRequests() {
    return parseInt(
      (await this.propertyService.getByKey<string>(
        PROPERTY_DATA_SOURCES_dexfolio_DATA_PROVIDER_MAX_REQUESTS
      )) || '0',
      10
    );
  }

  public async getQuotes({ requestTimeout, symbols }: GetQuotesParams) {
    const results: QuotesResponse = { quotes: {} };

    try {
      const promises: Promise<any>[] = [];

      for (const dataProvider of this.getDataProviderServices()) {
        const maximumNumberOfSymbolsPerRequest =
          dataProvider.getMaxNumberOfSymbolsPerRequest?.() ??
          Number.MAX_SAFE_INTEGER;

        for (
          let i = 0;
          i < symbols.length;
          i += maximumNumberOfSymbolsPerRequest
        ) {
          const symbolsChunk = symbols.slice(
            i,
            i + maximumNumberOfSymbolsPerRequest
          );

          const promise = Promise.resolve(
            dataProvider.getQuotes({ requestTimeout, symbols: symbolsChunk })
          );

          promises.push(
            promise.then(async (result) => {
              for (const [symbol, dataProviderResponse] of Object.entries(
                result
              )) {
                dataProviderResponse.dataSource = 'DEXFOLIO';

                if (
                  [
                    ...DERIVED_CURRENCIES.map(({ currency }) => {
                      return `${DEFAULT_CURRENCY}${currency}`;
                    }),
                    `${DEFAULT_CURRENCY}USX`
                  ].includes(symbol)
                ) {
                  continue;
                }

                results.quotes[symbol] = dataProviderResponse;

                for (const {
                  currency,
                  factor,
                  rootCurrency
                } of DERIVED_CURRENCIES) {
                  if (symbol === `${DEFAULT_CURRENCY}${rootCurrency}`) {
                    results.quotes[`${DEFAULT_CURRENCY}${currency}`] = {
                      ...dataProviderResponse,
                      currency,
                      marketPrice: new Big(
                        result[`${DEFAULT_CURRENCY}${rootCurrency}`].marketPrice
                      )
                        .mul(factor)
                        .toNumber(),
                      marketState: 'open'
                    };
                  }
                }
              }
            })
          );
        }

        await Promise.all(promises);
      }

      return results;
    } catch (error) {
      Logger.error(error, 'DexfolioService');

      throw error;
    }
  }

  public async getStatus({ user }: { user: UserWithSettings }) {
    return {
      dailyRequests: user.dataProviderdexfolioDailyRequests,
      dailyRequestsMax: await this.getMaxDailyRequests(),
      subscription: user.subscription
    };
  }

  public async incrementDailyRequests({ userId }: { userId: string }) {
    await this.prismaService.analytics.update({
      data: {
        dataProviderdexfolioDailyRequests: { increment: 1 }
      },
      where: { userId }
    });
  }

  public async lookup({
    includeIndices = false,
    query
  }: GetSearchParams): Promise<LookupResponse> {
    const results: LookupResponse = { items: [] };

    if (!query) {
      return results;
    }

    try {
      let lookupItems: LookupItem[] = [];
      const promises: Promise<{ items: LookupItem[] }>[] = [];

      if (query?.length < 2) {
        return { items: lookupItems };
      }

      for (const dataProviderService of this.getDataProviderServices()) {
        promises.push(
          dataProviderService.search({
            includeIndices,
            query
          })
        );
      }

      const searchResults = await Promise.all(promises);

      for (const { items } of searchResults) {
        if (items?.length > 0) {
          lookupItems = lookupItems.concat(items);
        }
      }

      const filteredItems = lookupItems
        .filter(({ currency }) => {
          // Only allow symbols with supported currency
          return currency ? true : false;
        })
        .sort(({ name: name1 }, { name: name2 }) => {
          return name1?.toLowerCase().localeCompare(name2?.toLowerCase());
        })
        .map((lookupItem) => {
          lookupItem.dataProviderInfo = this.getDataProviderInfo();
          lookupItem.dataSource = 'DEXFOLIO';

          return lookupItem;
        });

      results.items = filteredItems;

      return results;
    } catch (error) {
      Logger.error(error, 'DexfolioService');

      throw error;
    }
  }

  private getDataProviderInfo(): DataProviderInfo {
    const dataProviderService = new DexfolioDataProviderService(
      this.configurationService,
      this.propertyService
    );

    return {
      ...dataProviderService.getDataProviderInfo(),
      isPremium: false,
      name: 'dexfolio Premium'
    };
  }

  private getDataProviderServices() {
    return this.configurationService
      .get('DATA_SOURCES_dexfolio_DATA_PROVIDER')
      .map((dataSource) => {
        return this.dataProviderService.getDataProvider(DataSource[dataSource]);
      });
  }
}
