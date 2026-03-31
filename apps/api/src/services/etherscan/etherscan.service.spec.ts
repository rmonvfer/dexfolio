import { ConfigurationService } from '@dexfolio/api/services/configuration/configuration.service';

import { EtherscanService } from './etherscan.service';

jest.mock('@dexfolio/api/services/configuration/configuration.service', () => {
  return {
    ConfigurationService: jest.fn().mockImplementation(() => {
      return {
        get: (key: string) => {
          const config: Record<string, string | number> = {
            API_KEY_ETHERSCAN: 'test-api-key',
            REQUEST_TIMEOUT: 5000
          };
          return config[key];
        }
      };
    })
  };
});

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('EtherscanService', () => {
  let etherscanService: EtherscanService;
  let configurationService: ConfigurationService;

  beforeEach(() => {
    jest.clearAllMocks();
    configurationService = new ConfigurationService();
    etherscanService = new EtherscanService(configurationService);
  });

  describe('getEthBalance', () => {
    it('should return wei balance from API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: '1',
            message: 'OK',
            result: '2000000000000000000'
          })
      });

      const result = await etherscanService.getEthBalance(
        '0x742d35cc6634c0532925a3b844bc9e7595f2bd38'
      );

      expect(result).toEqual('2000000000000000000');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getNormalTransactions', () => {
    it('should return array of transactions', async () => {
      const mockTransactions = [
        {
          blockNumber: '12345678',
          timeStamp: '1625000000',
          hash: '0xabc',
          from: '0x123',
          to: '0x456',
          value: '1000000000000000000',
          gas: '21000',
          gasPrice: '20000000000',
          gasUsed: '21000',
          isError: '0'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: '1',
            message: 'OK',
            result: mockTransactions
          })
      });

      const result = await etherscanService.getNormalTransactions(
        '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
        0
      );

      expect(result).toEqual(mockTransactions);
    });

    it('should return empty array for "No transactions found"', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: '0',
            message: 'No transactions found',
            result: []
          })
      });

      const result = await etherscanService.getNormalTransactions(
        '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
        0
      );

      expect(result).toEqual([]);
    });
  });

  describe('getErc20Transfers', () => {
    it('should return array of ERC-20 transfers', async () => {
      const mockTransfers = [
        {
          blockNumber: '12345679',
          timeStamp: '1625100000',
          hash: '0xdef',
          from: '0x123',
          to: '0x456',
          value: '1000000000',
          contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          tokenName: 'USD Coin',
          tokenSymbol: 'USDC',
          tokenDecimal: '6'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: '1',
            message: 'OK',
            result: mockTransfers
          })
      });

      const result = await etherscanService.getErc20Transfers(
        '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
        0
      );

      expect(result).toEqual(mockTransfers);
    });

    it('should return empty array for "No transactions found"', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: '0',
            message: 'No transactions found',
            result: []
          })
      });

      const result = await etherscanService.getErc20Transfers(
        '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
        0
      );

      expect(result).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should throw when API returns non-ok HTTP status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(
        etherscanService.getEthBalance(
          '0x742d35cc6634c0532925a3b844bc9e7595f2bd38'
        )
      ).rejects.toThrow('Etherscan API request failed with status 500');
    });
  });
});
