import { environment } from '@dexfolio/api/environments/environment';
import { ConfigurationService } from '@dexfolio/api/services/configuration/configuration.service';
import {
  DataProviderInterface,
  GetAssetProfileParams,
  GetDividendsParams,
  GetHistoricalParams,
  GetQuotesParams,
  GetSearchParams
} from '@dexfolio/api/services/data-provider/interfaces/data-provider.interface';
import { PropertyService } from '@dexfolio/api/services/property/property.service';
import {
  HEADER_KEY_TOKEN,
  PROPERTY_API_KEY_dexfolio
} from '@dexfolio/common/config';
import { DATE_FORMAT } from '@dexfolio/common/helper';
import {
  DataProviderDexfolioAssetProfileResponse,
  DataProviderHistoricalResponse,
  DataProviderInfo,
  DataProviderResponse,
  DividendsResponse,
  HistoricalResponse,
  LookupResponse,
  QuotesResponse
} from '@dexfolio/common/interfaces';

import { Injectable, Logger } from '@nestjs/common';
import { DataSource, SymbolProfile } from '@prisma/client';
import { format } from 'date-fns';
import { StatusCodes } from 'http-status-codes';

@Injectable()
export class DexfolioService implements DataProviderInterface {
  private readonly URL = environment.production
    ? 'https://dexfol.io/api'
    : `${this.configurationService.get('ROOT_URL')}/api`;

  public constructor(
    private readonly configurationService: ConfigurationService,
    private readonly propertyService: PropertyService
  ) { }

  public canHandle() {
    return true;
  }

  public async getAssetProfile({
    requestTimeout = this.configurationService.get('REQUEST_TIMEOUT'),
    symbol
  }: GetAssetProfileParams): Promise<Partial<SymbolProfile>> {
    let assetProfile: DataProviderDexfolioAssetProfileResponse;

    try {
      const response = await fetch(
        `${this.URL}/v1/data-providers/dexfolio/asset-profile/${symbol}`,
        {
          headers: await this.getRequestHeaders(),
          signal: AbortSignal.timeout(requestTimeout)
        }
      );

      if (!response.ok) {
        throw new Response(await response.text(), {
          status: response.status,
          statusText: response.statusText
        });
      }

      assetProfile =
        (await response.json()) as DataProviderDexfolioAssetProfileResponse;
    } catch (error) {
      let message = error;

      if (['AbortError', 'TimeoutError'].includes(error?.name)) {
        message = `RequestError: The operation to get the asset profile for ${symbol} was aborted because the request to the data provider took more than ${(
          requestTimeout / 1000
        ).toFixed(3)} seconds`;
      } else if (error?.status === StatusCodes.TOO_MANY_REQUESTS) {
        message = 'RequestError: The daily request limit has been exceeded';
      } else if (
        [StatusCodes.FORBIDDEN, StatusCodes.UNAUTHORIZED].includes(
          error?.status
        )
      ) {
        message =
          'RequestError: The API key is invalid. Please update it in the Settings section of the Admin Control panel.';
      }

      Logger.error(message, 'DexfolioService');
    }

    return assetProfile;
  }

  public getDataProviderInfo(): DataProviderInfo {
    return {
      dataSource: DataSource.DEXFOLIO,
      isPremium: true,
      name: 'DEXFOLIO',
      url: 'https://dexfol.io'
    };
  }

  public async getDividends({
    from,
    granularity = 'day',
    requestTimeout = this.configurationService.get('REQUEST_TIMEOUT'),
    symbol,
    to
  }: GetDividendsParams): Promise<{
    [date: string]: DataProviderHistoricalResponse;
  }> {
    let dividends: {
      [date: string]: DataProviderHistoricalResponse;
    } = {};

    try {
      const queryParams = new URLSearchParams({
        granularity,
        from: format(from, DATE_FORMAT),
        to: format(to, DATE_FORMAT)
      });

      const response = await fetch(
        `${this.URL}/v2/data-providers/dexfolio/dividends/${symbol}?${queryParams.toString()}`,
        {
          headers: await this.getRequestHeaders(),
          signal: AbortSignal.timeout(requestTimeout)
        }
      );

      if (!response.ok) {
        throw new Response(await response.text(), {
          status: response.status,
          statusText: response.statusText
        });
      }

      dividends = ((await response.json()) as DividendsResponse).dividends;
    } catch (error) {
      let message = error;

      if (error?.status === StatusCodes.TOO_MANY_REQUESTS) {
        message = 'RequestError: The daily request limit has been exceeded';
      } else if (
        [StatusCodes.FORBIDDEN, StatusCodes.UNAUTHORIZED].includes(
          error?.status
        )
      ) {
        message =
          'RequestError: The API key is invalid. Please update it in the Settings section of the Admin Control panel.';
      }

      Logger.error(message, 'DexfolioService');
    }

    return dividends;
  }

  public async getHistorical({
    from,
    granularity = 'day',
    requestTimeout = this.configurationService.get('REQUEST_TIMEOUT'),
    symbol,
    to
  }: GetHistoricalParams): Promise<{
    [symbol: string]: { [date: string]: DataProviderHistoricalResponse };
  }> {
    try {
      const queryParams = new URLSearchParams({
        granularity,
        from: format(from, DATE_FORMAT),
        to: format(to, DATE_FORMAT)
      });

      const response = await fetch(
        `${this.URL}/v2/data-providers/dexfolio/historical/${symbol}?${queryParams.toString()}`,
        {
          headers: await this.getRequestHeaders(),
          signal: AbortSignal.timeout(requestTimeout)
        }
      );

      if (!response.ok) {
        throw new Response(await response.text(), {
          status: response.status,
          statusText: response.statusText
        });
      }

      const { historicalData } = (await response.json()) as HistoricalResponse;

      return {
        [symbol]: historicalData
      };
    } catch (error) {
      if (error?.status === StatusCodes.TOO_MANY_REQUESTS) {
        error.name = 'RequestError';
        error.message =
          'RequestError: The daily request limit has been exceeded';
      } else if (
        [StatusCodes.FORBIDDEN, StatusCodes.UNAUTHORIZED].includes(
          error?.status
        )
      ) {
        error.name = 'RequestError';
        error.message =
          'RequestError: The API key is invalid. Please update it in the Settings section of the Admin Control panel.';
      }

      Logger.error(error.message, 'DexfolioService');

      throw new Error(
        `Could not get historical market data for ${symbol} (${this.getName()}) from ${format(
          from,
          DATE_FORMAT
        )} to ${format(to, DATE_FORMAT)}: [${error.name}] ${error.message}`
      );
    }
  }

  public getMaxNumberOfSymbolsPerRequest() {
    return 20;
  }

  public getName(): DataSource {
    return DataSource.DEXFOLIO;
  }

  public async getQuotes({
    requestTimeout = this.configurationService.get('REQUEST_TIMEOUT'),
    symbols
  }: GetQuotesParams): Promise<{
    [symbol: string]: DataProviderResponse;
  }> {
    let quotes: { [symbol: string]: DataProviderResponse } = {};

    if (symbols.length <= 0) {
      return quotes;
    }

    try {
      const queryParams = new URLSearchParams({
        symbols: symbols.join(',')
      });

      const response = await fetch(
        `${this.URL}/v2/data-providers/dexfolio/quotes?${queryParams.toString()}`,
        {
          headers: await this.getRequestHeaders(),
          signal: AbortSignal.timeout(requestTimeout)
        }
      );

      if (!response.ok) {
        throw new Response(await response.text(), {
          status: response.status,
          statusText: response.statusText
        });
      }

      quotes = ((await response.json()) as QuotesResponse).quotes;
    } catch (error) {
      let message = error;

      if (['AbortError', 'TimeoutError'].includes(error?.name)) {
        message = `RequestError: The operation to get the quotes for ${symbols.join(
          ', '
        )} was aborted because the request to the data provider took more than ${(
          requestTimeout / 1000
        ).toFixed(3)} seconds`;
      } else if (error?.status === StatusCodes.TOO_MANY_REQUESTS) {
        message = 'RequestError: The daily request limit has been exceeded';
      } else if (
        [StatusCodes.FORBIDDEN, StatusCodes.UNAUTHORIZED].includes(
          error?.status
        )
      ) {
        message =
          'RequestError: The API key is invalid. Please update it in the Settings section of the Admin Control panel.';
      }

      Logger.error(message, 'DexfolioService');
    }

    return quotes;
  }

  public getTestSymbol() {
    return 'AAPL';
  }

  public async search({
    query,
    requestTimeout = this.configurationService.get('REQUEST_TIMEOUT')
  }: GetSearchParams): Promise<LookupResponse> {
    let searchResult: LookupResponse = { items: [] };

    try {
      const queryParams = new URLSearchParams({
        query
      });

      const response = await fetch(
        `${this.URL}/v2/data-providers/dexfolio/lookup?${queryParams.toString()}`,
        {
          headers: await this.getRequestHeaders(),
          signal: AbortSignal.timeout(requestTimeout)
        }
      );

      if (!response.ok) {
        throw new Response(await response.text(), {
          status: response.status,
          statusText: response.statusText
        });
      }

      searchResult = (await response.json()) as LookupResponse;
    } catch (error) {
      let message = error;

      if (['AbortError', 'TimeoutError'].includes(error?.name)) {
        message = `RequestError: The operation to search for ${query} was aborted because the request to the data provider took more than ${(
          requestTimeout / 1000
        ).toFixed(3)} seconds`;
      } else if (error?.status === StatusCodes.TOO_MANY_REQUESTS) {
        message = 'RequestError: The daily request limit has been exceeded';
      } else if (
        [StatusCodes.FORBIDDEN, StatusCodes.UNAUTHORIZED].includes(
          error?.status
        )
      ) {
        message =
          'RequestError: The API key is invalid. Please update it in the Settings section of the Admin Control panel.';
      }

      Logger.error(message, 'DexfolioService');
    }

    return searchResult;
  }

  private async getRequestHeaders() {
    const apiKey = await this.propertyService.getByKey<string>(
      PROPERTY_API_KEY_dexfolio
    );

    return {
      [HEADER_KEY_TOKEN]: `Api-Key ${apiKey}`
    };
  }
}
