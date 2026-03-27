import { PortfolioCalculator } from '@dexfolio/api/app/portfolio/calculator/portfolio-calculator';
import {
  AssetProfileIdentifier,
  SymbolMetrics
} from '@dexfolio/common/interfaces';
import { PortfolioSnapshot } from '@dexfolio/common/models';
import { PerformanceCalculationType } from '@dexfolio/common/types/performance-calculation-type.type';

export class RoiPortfolioCalculator extends PortfolioCalculator {
  protected calculateOverallPerformance(): PortfolioSnapshot {
    throw new Error('Method not implemented.');
  }

  protected getPerformanceCalculationType() {
    return PerformanceCalculationType.ROI;
  }

  protected getSymbolMetrics({ }: {
    end: Date;
    exchangeRates: { [dateString: string]: number };
    marketSymbolMap: {
      [date: string]: { [symbol: string]: Big };
    };
    start: Date;
    step?: number;
  } & AssetProfileIdentifier): SymbolMetrics {
    throw new Error('Method not implemented.');
  }
}
