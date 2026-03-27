import { DataProviderHistoricalResponse } from '@dexfolio/common/interfaces';

export interface DividendsResponse {
  dividends: {
    [date: string]: DataProviderHistoricalResponse;
  };
}
