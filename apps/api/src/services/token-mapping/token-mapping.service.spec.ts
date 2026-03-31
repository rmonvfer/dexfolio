import { ConfigurationService } from '@dexfolio/api/services/configuration/configuration.service';

import { TokenMappingService } from './token-mapping.service';

jest.mock('@dexfolio/api/services/configuration/configuration.service', () => {
  return {
    ConfigurationService: jest.fn().mockImplementation(() => {
      return {
        get: (key: string) => {
          switch (key) {
            case 'API_KEY_COINGECKO_DEMO':
              return 'test-demo-key';
            case 'API_KEY_COINGECKO_PRO':
              return '';
            case 'REQUEST_TIMEOUT':
              return 3000;
            default:
              return '';
          }
        }
      };
    })
  };
});

const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const UNKNOWN_ADDRESS = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';

describe('TokenMappingService', () => {
  let configurationService: ConfigurationService;
  let tokenMappingService: TokenMappingService;
  let fetchSpy: jest.SpyInstance;

  beforeAll(async () => {
    configurationService = new ConfigurationService();
    tokenMappingService = new TokenMappingService(configurationService);
  });

  beforeEach(() => {
    fetchSpy = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('resolves a known contract address to a CoinGecko ID', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'usd-coin' })
    });

    const result = await tokenMappingService.getCoinGeckoId(USDC_ADDRESS);

    expect(result).toEqual('usd-coin');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      `https://api.coingecko.com/api/v3/coins/ethereum/contract/${USDC_ADDRESS.toLowerCase()}`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-cg-demo-api-key': 'test-demo-key'
        })
      })
    );
  });

  it('returns undefined for an unknown contract address', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    const result = await tokenMappingService.getCoinGeckoId(UNKNOWN_ADDRESS);

    expect(result).toBeUndefined();
  });

  it('returns cached result without making a second HTTP request', async () => {
    const service = new TokenMappingService(configurationService);

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'wrapped-bitcoin' })
    });

    const first = await service.getCoinGeckoId(
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
    );
    const second = await service.getCoinGeckoId(
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
    );

    expect(first).toEqual('wrapped-bitcoin');
    expect(second).toEqual('wrapped-bitcoin');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('caches undefined for failed lookups', async () => {
    const service = new TokenMappingService(configurationService);

    fetchSpy.mockRejectedValueOnce(new Error('Network error'));

    const first = await service.getCoinGeckoId(
      '0x1111111111111111111111111111111111111111'
    );
    const second = await service.getCoinGeckoId(
      '0x1111111111111111111111111111111111111111'
    );

    expect(first).toBeUndefined();
    expect(second).toBeUndefined();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
