import { Rule } from '@dexfolio/api/models/rule';
import { ExchangeRateDataService } from '@dexfolio/api/services/exchange-rate-data/exchange-rate-data.service';
import { I18nService } from '@dexfolio/api/services/i18n/i18n.service';
import {
  PortfolioDetails,
  RuleSettings,
  UserSettings
} from '@dexfolio/common/interfaces';

export class AccountClusterRiskSingleAccount extends Rule<RuleSettings> {
  private accounts: PortfolioDetails['accounts'];

  public constructor(
    protected exchangeRateDataService: ExchangeRateDataService,
    private i18nService: I18nService,
    languageCode: string,
    accounts: PortfolioDetails['accounts']
  ) {
    super(exchangeRateDataService, {
      languageCode,
      key: AccountClusterRiskSingleAccount.name
    });

    this.accounts = accounts;
  }

  public evaluate() {
    const accountIds: string[] = Object.keys(this.accounts);

    if (accountIds.length === 0) {
      return {
        evaluation: this.i18nService.getTranslation({
          id: 'rule.accountClusterRiskSingleAccount.false.invalid',
          languageCode: this.getLanguageCode()
        }),
        value: false
      };
    } else if (accountIds.length === 1) {
      return {
        evaluation: this.i18nService.getTranslation({
          id: 'rule.accountClusterRiskSingleAccount.false',
          languageCode: this.getLanguageCode()
        }),
        value: false
      };
    }

    return {
      evaluation: this.i18nService.getTranslation({
        id: 'rule.accountClusterRiskSingleAccount.true',
        languageCode: this.getLanguageCode(),
        placeholders: {
          accountsLength: accountIds.length
        }
      }),
      value: true
    };
  }

  public getCategoryName() {
    return this.i18nService.getTranslation({
      id: 'rule.accountClusterRisk.category',
      languageCode: this.getLanguageCode()
    });
  }

  public getConfiguration() {
    return undefined;
  }

  public getName() {
    return this.i18nService.getTranslation({
      id: 'rule.accountClusterRiskSingleAccount',
      languageCode: this.getLanguageCode()
    });
  }

  public getSettings({ locale, xRayRules }: UserSettings): RuleSettings {
    return {
      locale,
      isActive: xRayRules?.[this.getKey()]?.isActive ?? true
    };
  }
}
