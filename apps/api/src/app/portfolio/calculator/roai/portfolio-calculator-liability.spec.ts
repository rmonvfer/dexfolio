import {
  activityDummyData,
  symbolProfileDummyData,
  userDummyData
} from '@dexfolio/api/app/portfolio/calculator/portfolio-calculator-test-utils';
import { PortfolioCalculatorFactory } from '@dexfolio/api/app/portfolio/calculator/portfolio-calculator.factory';
import { CurrentRateService } from '@dexfolio/api/app/portfolio/current-rate.service';
import { CurrentRateServiceMock } from '@dexfolio/api/app/portfolio/current-rate.service.mock';
import { RedisCacheService } from '@dexfolio/api/app/redis-cache/redis-cache.service';
import { RedisCacheServiceMock } from '@dexfolio/api/app/redis-cache/redis-cache.service.mock';
import { ConfigurationService } from '@dexfolio/api/services/configuration/configuration.service';
import { ExchangeRateDataService } from '@dexfolio/api/services/exchange-rate-data/exchange-rate-data.service';
import { PortfolioSnapshotService } from '@dexfolio/api/services/queues/portfolio-snapshot/portfolio-snapshot.service';
import { PortfolioSnapshotServiceMock } from '@dexfolio/api/services/queues/portfolio-snapshot/portfolio-snapshot.service.mock';
import { parseDate } from '@dexfolio/common/helper';
import { Activity } from '@dexfolio/common/interfaces';
import { PerformanceCalculationType } from '@dexfolio/common/types/performance-calculation-type.type';

import { Big } from 'big.js';

jest.mock('@dexfolio/api/app/portfolio/current-rate.service', () => {
  return {
    CurrentRateService: jest.fn().mockImplementation(() => {
      return CurrentRateServiceMock;
    })
  };
});

jest.mock(
  '@dexfolio/api/services/queues/portfolio-snapshot/portfolio-snapshot.service',
  () => {
    return {
      PortfolioSnapshotService: jest.fn().mockImplementation(() => {
        return PortfolioSnapshotServiceMock;
      })
    };
  }
);

jest.mock('@dexfolio/api/app/redis-cache/redis-cache.service', () => {
  return {
    RedisCacheService: jest.fn().mockImplementation(() => {
      return RedisCacheServiceMock;
    })
  };
});

describe('PortfolioCalculator', () => {
  let configurationService: ConfigurationService;
  let currentRateService: CurrentRateService;
  let exchangeRateDataService: ExchangeRateDataService;
  let portfolioCalculatorFactory: PortfolioCalculatorFactory;
  let portfolioSnapshotService: PortfolioSnapshotService;
  let redisCacheService: RedisCacheService;

  beforeEach(() => {
    configurationService = new ConfigurationService();

    currentRateService = new CurrentRateService(null, null, null, null);

    exchangeRateDataService = new ExchangeRateDataService(
      null,
      null,
      null,
      null
    );

    portfolioSnapshotService = new PortfolioSnapshotService(null);

    redisCacheService = new RedisCacheService(null, null);

    portfolioCalculatorFactory = new PortfolioCalculatorFactory(
      configurationService,
      currentRateService,
      exchangeRateDataService,
      portfolioSnapshotService,
      redisCacheService
    );
  });

  describe('compute portfolio snapshot', () => {
    it.only('with liability activity', async () => {
      jest.useFakeTimers().setSystemTime(parseDate('2022-01-31').getTime());

      const activities: Activity[] = [
        {
          ...activityDummyData,
          date: new Date('2023-01-01'), // Date in future
          feeInAssetProfileCurrency: 0,
          feeInBaseCurrency: 0,
          quantity: 1,
          SymbolProfile: {
            ...symbolProfileDummyData,
            currency: 'USD',
            dataSource: 'MANUAL',
            name: 'Loan',
            symbol: '55196015-1365-4560-aa60-8751ae6d18f8'
          },
          type: 'LIABILITY',
          unitPriceInAssetProfileCurrency: 3000
        }
      ];

      const portfolioCalculator = portfolioCalculatorFactory.createCalculator({
        activities,
        calculationType: PerformanceCalculationType.ROAI,
        currency: 'USD',
        userId: userDummyData.id
      });

      const portfolioSnapshot = await portfolioCalculator.computeSnapshot();

      expect(portfolioSnapshot.totalLiabilitiesWithCurrencyEffect).toEqual(
        new Big(3000)
      );
    });
  });
});
