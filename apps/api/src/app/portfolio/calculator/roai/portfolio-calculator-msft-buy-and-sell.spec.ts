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

  describe('get transaction point', () => {
    it('with MSFT buy and sell with fractional quantities (multiples of 1/3)', () => {
      jest.useFakeTimers().setSystemTime(parseDate('2024-04-01').getTime());

      const activities: Activity[] = [
        {
          ...activityDummyData,
          date: new Date('2024-03-08'),
          feeInAssetProfileCurrency: 0,
          feeInBaseCurrency: 0,
          quantity: 0.3333333333333333,
          SymbolProfile: {
            ...symbolProfileDummyData,
            currency: 'USD',
            dataSource: 'YAHOO',
            name: 'Microsoft Inc.',
            symbol: 'MSFT'
          },
          type: 'BUY',
          unitPriceInAssetProfileCurrency: 408
        },
        {
          ...activityDummyData,
          date: new Date('2024-03-13'),
          feeInAssetProfileCurrency: 0,
          feeInBaseCurrency: 0,
          quantity: 0.6666666666666666,
          SymbolProfile: {
            ...symbolProfileDummyData,
            currency: 'USD',
            dataSource: 'YAHOO',
            name: 'Microsoft Inc.',
            symbol: 'MSFT'
          },
          type: 'BUY',
          unitPriceInAssetProfileCurrency: 400
        },
        {
          ...activityDummyData,
          date: new Date('2024-03-14'),
          feeInAssetProfileCurrency: 0,
          feeInBaseCurrency: 0,
          quantity: 1,
          SymbolProfile: {
            ...symbolProfileDummyData,
            currency: 'USD',
            dataSource: 'YAHOO',
            name: 'Microsoft Inc.',
            symbol: 'MSFT'
          },
          type: 'SELL',
          unitPriceInAssetProfileCurrency: 411
        }
      ];

      const portfolioCalculator = portfolioCalculatorFactory.createCalculator({
        activities,
        calculationType: PerformanceCalculationType.ROAI,
        currency: 'USD',
        userId: userDummyData.id
      });

      const transactionPoints = portfolioCalculator.getTransactionPoints();
      const lastTransactionPoint =
        transactionPoints[transactionPoints.length - 1];
      const position = lastTransactionPoint.items.find(
        (item) => item.symbol === 'MSFT'
      );

      expect(position.investment.toNumber()).toBe(0);
      expect(position.quantity.toNumber()).toBe(0);
    });
  });
});
