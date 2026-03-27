import {
  activityDummyData,
  loadExportFile,
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
import { Activity, ExportResponse } from '@dexfolio/common/interfaces';
import { PerformanceCalculationType } from '@dexfolio/common/types/performance-calculation-type.type';

import { Big } from 'big.js';
import { join } from 'node:path';

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
  let exportResponse: ExportResponse;

  let configurationService: ConfigurationService;
  let currentRateService: CurrentRateService;
  let exchangeRateDataService: ExchangeRateDataService;
  let portfolioCalculatorFactory: PortfolioCalculatorFactory;
  let portfolioSnapshotService: PortfolioSnapshotService;
  let redisCacheService: RedisCacheService;

  beforeAll(() => {
    exportResponse = loadExportFile(
      join(__dirname, '../../../../../../../test/import/ok/btcusd-short.json')
    );
  });

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

  describe('get current positions', () => {
    it.only('with BTCUSD short sell (in USD)', async () => {
      jest.useFakeTimers().setSystemTime(parseDate('2022-01-14').getTime());

      const activities: Activity[] = exportResponse.activities.map(
        (activity) => ({
          ...activityDummyData,
          ...activity,
          date: parseDate(activity.date),
          feeInAssetProfileCurrency: activity.fee,
          feeInBaseCurrency: activity.fee,
          SymbolProfile: {
            ...symbolProfileDummyData,
            currency: 'USD',
            dataSource: activity.dataSource,
            name: 'Bitcoin',
            symbol: activity.symbol
          },
          unitPriceInAssetProfileCurrency: activity.unitPrice
        })
      );

      const portfolioCalculator = portfolioCalculatorFactory.createCalculator({
        activities,
        calculationType: PerformanceCalculationType.ROAI,
        currency: exportResponse.user.settings.currency,
        userId: userDummyData.id
      });

      const portfolioSnapshot = await portfolioCalculator.computeSnapshot();

      expect(portfolioSnapshot.positions[0].averagePrice).toEqual(
        Big(45647.95)
      );
    });
  });
});
