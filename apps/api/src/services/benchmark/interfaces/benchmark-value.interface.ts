import { BenchmarkResponse } from '@dexfolio/common/interfaces';

export interface BenchmarkValue {
  benchmarks: BenchmarkResponse['benchmarks'];
  expiration: number;
}
