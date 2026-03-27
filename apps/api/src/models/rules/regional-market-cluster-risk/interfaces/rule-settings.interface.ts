import { RuleSettings } from '@dexfolio/common/interfaces';

export interface Settings extends RuleSettings {
  baseCurrency: string;
  thresholdMin: number;
  thresholdMax: number;
}
