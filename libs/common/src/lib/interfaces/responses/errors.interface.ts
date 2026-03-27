import { AssetProfileIdentifier } from '@dexfolio/common/interfaces';

export interface ResponseError {
  errors?: AssetProfileIdentifier[];
  hasErrors: boolean;
}
