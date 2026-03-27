import { UserWithSettings } from '@dexfolio/common/types';

export interface DataProviderDexfolioStatusResponse {
  dailyRequests: number;
  dailyRequestsMax: number;
  subscription: UserWithSettings['subscription'];
}
