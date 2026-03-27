import {
  AssetProfileIdentifier,
  HistoricalDataItem
} from '@dexfolio/common/interfaces';

export interface SymbolItem extends AssetProfileIdentifier {
  currency: string;
  historicalData: HistoricalDataItem[];
  marketPrice: number;
}
