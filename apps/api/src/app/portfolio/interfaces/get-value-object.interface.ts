import { AssetProfileIdentifier } from '@dexfolio/common/interfaces';

export interface GetValueObject extends AssetProfileIdentifier {
  date: Date;
  marketPrice: number;
}
