import { ConfigurationService } from '@dexfolio/api/services/configuration/configuration.service';

import { Injectable, Logger } from '@nestjs/common';

import {
  Erc20Transfer,
  EtherscanApiResponse,
  EtherscanTransaction
} from './interfaces';

@Injectable()
export class EtherscanService {
  private static readonly API_URL = 'https://api.etherscan.io/api';
  private static readonly RATE_LIMIT_DELAY_MS = 200;

  private readonly logger = new Logger(EtherscanService.name);

  public constructor(
    private readonly configurationService: ConfigurationService
  ) {}

  public async getBlockNumber(): Promise<number> {
    const response = await this.request<string>({
      module: 'proxy',
      action: 'eth_blockNumber'
    });

    return parseInt(response.result, 16);
  }

  public async getEthBalance(address: string): Promise<string> {
    const response = await this.request<string>({
      module: 'account',
      action: 'balance',
      address,
      tag: 'latest'
    });

    return response.result;
  }

  public async getNormalTransactions(
    address: string,
    startBlock: number
  ): Promise<EtherscanTransaction[]> {
    const response = await this.request<EtherscanTransaction[]>({
      module: 'account',
      action: 'txlist',
      address,
      startblock: String(startBlock),
      endblock: '99999999',
      sort: 'asc'
    });

    if (
      response.status === '0' &&
      response.message === 'No transactions found'
    ) {
      return [];
    }

    if (response.status === '0') {
      this.logger.warn(`Etherscan API error for txlist: ${response.message}`);
      return [];
    }

    return response.result;
  }

  public async getErc20Transfers(
    address: string,
    startBlock: number
  ): Promise<Erc20Transfer[]> {
    const response = await this.request<Erc20Transfer[]>({
      module: 'account',
      action: 'tokentx',
      address,
      startblock: String(startBlock),
      endblock: '99999999',
      sort: 'asc'
    });

    if (
      response.status === '0' &&
      response.message === 'No transactions found'
    ) {
      return [];
    }

    if (response.status === '0') {
      this.logger.warn(`Etherscan API error for tokentx: ${response.message}`);
      return [];
    }

    return response.result;
  }

  private async request<T>(
    params: Record<string, string>
  ): Promise<EtherscanApiResponse<T>> {
    const apiKey = this.configurationService.get('API_KEY_ETHERSCAN');

    const searchParams = new URLSearchParams({
      ...params,
      apikey: apiKey
    });

    const url = `${EtherscanService.API_URL}?${searchParams.toString()}`;

    return this.fetchWithRetry<T>(url);
  }

  private async fetchWithRetry<T>(
    url: string,
    maxAttempts = 3
  ): Promise<EtherscanApiResponse<T>> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await this.delay(EtherscanService.RATE_LIMIT_DELAY_MS);

      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(
            this.configurationService.get('REQUEST_TIMEOUT')
          )
        });

        if (!response.ok) {
          throw new Error(
            `Etherscan API request failed with status ${response.status}`
          );
        }

        return response.json();
      } catch (error) {
        if (attempt < maxAttempts) {
          const backoffMs = Math.pow(2, attempt - 1) * 1000;

          this.logger.warn(
            `Etherscan API request failed (attempt ${attempt}/${maxAttempts}): ${error.message}. Retrying in ${backoffMs}ms...`
          );

          await this.delay(backoffMs);
        } else {
          throw error;
        }
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
