import { DataProviderResponse } from '@dexfolio/common/interfaces';

export interface QuotesResponse {
  quotes: { [symbol: string]: DataProviderResponse };
}
