import { ConfigurationService } from '@dexfolio/api/services/configuration/configuration.service';

import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from '@prisma/client';
import { LRUCache } from 'lru-cache';

@Injectable()
export class TokenMappingService {
  private readonly cache = new LRUCache<string, string>({
    max: 10000,
    ttl: 86400000
  });
  private readonly logger = new Logger(TokenMappingService.name);

  // ETH itself is not a contract, map it directly
  private static readonly ETH_COINGECKO_ID = 'ethereum';

  public constructor(
    private readonly configurationService: ConfigurationService
  ) {}

  public async getCoinGeckoId(
    contractAddress: string
  ): Promise<string | undefined> {
    const normalizedAddress = contractAddress.toLowerCase();

    // Native ETH placeholder addresses are not real contracts
    if (
      normalizedAddress === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ||
      normalizedAddress === '0x0000000000000000000000000000000000000000'
    ) {
      return TokenMappingService.ETH_COINGECKO_ID;
    }

    if (this.cache.has(normalizedAddress)) {
      return this.cache.get(normalizedAddress);
    }

    try {
      const apiKeyDemo = this.configurationService.get(
        'API_KEY_COINGECKO_DEMO'
      );
      const apiKeyPro = this.configurationService.get('API_KEY_COINGECKO_PRO');

      const headers: HeadersInit = {};
      let apiUrl = 'https://api.coingecko.com/api/v3';

      if (apiKeyDemo) {
        headers['x-cg-demo-api-key'] = apiKeyDemo;
      }

      if (apiKeyPro) {
        apiUrl = 'https://pro-api.coingecko.com/api/v3';
        headers['x-cg-pro-api-key'] = apiKeyPro;
      }

      const response = await fetch(
        `${apiUrl}/coins/ethereum/contract/${normalizedAddress}`,
        {
          headers,
          signal: AbortSignal.timeout(
            this.configurationService.get('REQUEST_TIMEOUT')
          )
        }
      );

      if (!response.ok) {
        return undefined;
      }

      const data = await response.json();
      const coinId = data.id as string;

      this.cache.set(normalizedAddress, coinId);
      return coinId;
    } catch (error) {
      let message = error;

      if (['AbortError', 'TimeoutError'].includes(error?.name)) {
        message = `RequestError: The operation to resolve token ${contractAddress} was aborted because the request to the data provider took more than ${(
          this.configurationService.get('REQUEST_TIMEOUT') / 1000
        ).toFixed(3)} seconds`;
      }

      this.logger.warn(message);
      return undefined;
    }
  }

  public async getSymbolForToken(contractAddress: string): Promise<
    | {
        symbol: string;
        dataSource: DataSource;
        name: string;
        currency: string;
      }
    | undefined
  > {
    const coinId = await this.getCoinGeckoId(contractAddress);

    if (!coinId) {
      return undefined;
    }

    return {
      symbol: coinId,
      dataSource: DataSource.COINGECKO,
      name: coinId,
      currency: 'USD'
    };
  }
}
