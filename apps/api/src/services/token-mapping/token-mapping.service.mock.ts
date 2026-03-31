import { TokenMappingService } from './token-mapping.service';

export const TokenMappingServiceMock: Partial<TokenMappingService> = {
  getCoinGeckoId: jest.fn().mockImplementation((address: string) => {
    const map: Record<string, string> = {
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'usd-coin',
      '0xdac17f958d2ee523a2206206994597c13d831ec7': 'tether'
    };
    return Promise.resolve(map[address.toLowerCase()]);
  }),
  getSymbolForToken: jest.fn()
};
