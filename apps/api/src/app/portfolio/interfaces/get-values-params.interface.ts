import { DataGatheringItem } from '@dexfolio/api/services/interfaces/interfaces';

import { DateQuery } from './date-query.interface';

export interface GetValuesParams {
  dataGatheringItems: DataGatheringItem[];
  dateQuery: DateQuery;
}
