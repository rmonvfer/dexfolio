import { SymbolItem } from '@dexfolio/common/interfaces';

export interface MarketDataOfMarketsResponse {
  fearAndGreedIndex: {
    CRYPTOCURRENCIES: SymbolItem;
    STOCKS: SymbolItem;
  };
}
