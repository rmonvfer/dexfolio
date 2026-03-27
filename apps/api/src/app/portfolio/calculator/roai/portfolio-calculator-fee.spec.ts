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
    it.only('with fee activity', async () => {
      jest.useFakeTimers().setSystemTime(parseDate('2021-12-18').getTime());

      const activities: Activity[] = [
        {
          ...activityDummyData,
          date: new Date('2021-09-01'),
          feeInAssetProfileCurrency: 49,
          feeInBaseCurrency: 49,
          quantity: 0,
          SymbolProfile: {
            ...symbolProfileDummyData,
            currency: 'USD',
            dataSource: 'MANUAL',
            name: 'Account Opening Fee',
            symbol: '2c463fb3-af07-486e-adb0-8301b3d72141'
          },
          type: 'FEE',
          unitPriceInAssetProfileCurrency: 0
        }
      ];

      const portfolioCalculator = portfolioCalculatorFactory.createCalculator({
        activities,
        calculationType: PerformanceCalculationType.ROAI,
        currency: 'USD',
        userId: userDummyData.id
      });

      const portfolioSnapshot = await portfolioCalculator.computeSnapshot();

      expect(portfolioSnapshot).toMatchObject({
        currentValueInBaseCurrency: new Big('0'),
        errors: [],
        hasErrors: true,
        positions: [],
        totalFeesWithCurrencyEffect: new Big('49'),
        totalInterestWithCurrencyEffect: new Big('0'),
        totalInvestment: new Big('0'),
        totalInvestmentWithCurrencyEffect: new Big('0'),
        totalLiabilitiesWithCurrencyEffect: new Big('0')
      });

      expect(portfolioSnapshot.historicalData.at(-1)).toMatchObject(
        expect.objectContaining({
          netPerformance: 0,
          netPerformanceInPercentage: 0,
          netPerformanceInPercentageWithCurrencyEffect: 0,
          netPerformanceWithCurrencyEffect: 0,
          totalInvestment: 0,
          totalInvestmentValueWithCurrencyEffect: 0
        })
      );
    });
  });
});
