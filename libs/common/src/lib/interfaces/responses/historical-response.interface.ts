import { DataProviderHistoricalResponse } from '@dexfolio/common/interfaces';

export interface HistoricalResponse {
  historicalData: {
    [date: string]: DataProviderHistoricalResponse;
  };
}
