import { DataProviderInfo } from '@dexfolio/common/interfaces';
import { MarketState } from '@dexfolio/common/types';

import { DataSource } from '@prisma/client';

export interface DataProviderHistoricalResponse {
  marketPrice: number;
}

export interface DataProviderResponse {
  currency: string;
  dataProviderInfo?: DataProviderInfo;
  dataSource: DataSource;
  marketPrice: number;
  marketState: MarketState;
}
