import { CurrentRateService } from '@dexfolio/api/app/portfolio/current-rate.service';
import { RedisCacheService } from '@dexfolio/api/app/redis-cache/redis-cache.service';
import { ConfigurationService } from '@dexfolio/api/services/configuration/configuration.service';
import { ExchangeRateDataService } from '@dexfolio/api/services/exchange-rate-data/exchange-rate-data.service';
import { PortfolioSnapshotService } from '@dexfolio/api/services/queues/portfolio-snapshot/portfolio-snapshot.service';
import {
  Activity,
  Filter,
  HistoricalDataItem
} from '@dexfolio/common/interfaces';
import { PerformanceCalculationType } from '@dexfolio/common/types/performance-calculation-type.type';

import { Injectable } from '@nestjs/common';

import { MwrPortfolioCalculator } from './mwr/portfolio-calculator';
import { PortfolioCalculator } from './portfolio-calculator';
import { RoaiPortfolioCalculator } from './roai/portfolio-calculator';
import { RoiPortfolioCalculator } from './roi/portfolio-calculator';
import { TwrPortfolioCalculator } from './twr/portfolio-calculator';

@Injectable()
export class PortfolioCalculatorFactory {
  public constructor(
    private readonly configurationService: ConfigurationService,
    private readonly currentRateService: CurrentRateService,
    private readonly exchangeRateDataService: ExchangeRateDataService,
    private readonly portfolioSnapshotService: PortfolioSnapshotService,
    private readonly redisCacheService: RedisCacheService
  ) { }

  public createCalculator({
    accountBalanceItems = [],
    activities,
    calculationType,
    currency,
    filters = [],
    userId
  }: {
    accountBalanceItems?: HistoricalDataItem[];
    activities: Activity[];
    calculationType: PerformanceCalculationType;
    currency: string;
    filters?: Filter[];
    userId: string;
  }): PortfolioCalculator {
    switch (calculationType) {
      case PerformanceCalculationType.MWR:
        return new MwrPortfolioCalculator({
          accountBalanceItems,
          activities,
          currency,
          filters,
          userId,
          configurationService: this.configurationService,
          currentRateService: this.currentRateService,
          exchangeRateDataService: this.exchangeRateDataService,
          portfolioSnapshotService: this.portfolioSnapshotService,
          redisCacheService: this.redisCacheService
        });

      case PerformanceCalculationType.ROAI:
        return new RoaiPortfolioCalculator({
          accountBalanceItems,
          activities,
          currency,
          filters,
          userId,
          configurationService: this.configurationService,
          currentRateService: this.currentRateService,
          exchangeRateDataService: this.exchangeRateDataService,
          portfolioSnapshotService: this.portfolioSnapshotService,
          redisCacheService: this.redisCacheService
        });

      case PerformanceCalculationType.ROI:
        return new RoiPortfolioCalculator({
          accountBalanceItems,
          activities,
          currency,
          filters,
          userId,
          configurationService: this.configurationService,
          currentRateService: this.currentRateService,
          exchangeRateDataService: this.exchangeRateDataService,
          portfolioSnapshotService: this.portfolioSnapshotService,
          redisCacheService: this.redisCacheService
        });

      case PerformanceCalculationType.TWR:
        return new TwrPortfolioCalculator({
          accountBalanceItems,
          activities,
          currency,
          filters,
          userId,
          configurationService: this.configurationService,
          currentRateService: this.currentRateService,
          exchangeRateDataService: this.exchangeRateDataService,
          portfolioSnapshotService: this.portfolioSnapshotService,
          redisCacheService: this.redisCacheService
        });

      default:
        throw new Error('Invalid calculation type');
    }
  }
}
