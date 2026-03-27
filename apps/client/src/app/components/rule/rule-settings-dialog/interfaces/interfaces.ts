import {
  PortfolioReportRule,
  XRayRulesSettings
} from '@dexfolio/common/interfaces';

export interface RuleSettingsDialogParams {
  categoryName: string;
  locale: string;
  rule: PortfolioReportRule;
  settings: XRayRulesSettings['AccountClusterRiskCurrentInvestment'];
}
