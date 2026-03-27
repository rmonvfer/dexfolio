import { Filter } from '@dexfolio/common/interfaces';
import { PerformanceCalculationType } from '@dexfolio/common/types/performance-calculation-type.type';

export interface PortfolioSnapshotQueueJob {
  calculationType: PerformanceCalculationType;
  filters: Filter[];
  userCurrency: string;
  userId: string;
}
