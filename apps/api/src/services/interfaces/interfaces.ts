import { AssetProfileIdentifier } from '@dexfolio/common/interfaces';

export interface DataGatheringItem extends AssetProfileIdentifier {
  date?: Date;
  force?: boolean;
}
