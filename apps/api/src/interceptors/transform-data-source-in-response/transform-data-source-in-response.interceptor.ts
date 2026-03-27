import { redactPaths } from '@dexfolio/api/helper/object.helper';
import { ConfigurationService } from '@dexfolio/api/services/configuration/configuration.service';
import { encodeDataSource } from '@dexfolio/common/helper';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { DataSource } from '@prisma/client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformDataSourceInResponseInterceptor<
  T
> implements NestInterceptor<T, any> {
  private encodedDataSourceMap: {
    [dataSource: string]: string;
  } = {};

  public constructor(
    private readonly configurationService: ConfigurationService
  ) {
    if (this.configurationService.get('ENABLE_FEATURE_SUBSCRIPTION')) {
      this.encodedDataSourceMap = Object.keys(DataSource).reduce(
        (encodedDataSourceMap, dataSource) => {
          if (!['DEXFOLIO', 'MANUAL'].includes(dataSource)) {
            encodedDataSourceMap[dataSource] = encodeDataSource(
              DataSource[dataSource]
            );
          }

          return encodedDataSourceMap;
        },
        {}
      );
    }
  }

  public intercept(
    context: ExecutionContext,
    next: CallHandler<T>
  ): Observable<any> {
    const isExportMode = context.getClass().name === 'ExportController';

    return next.handle().pipe(
      map((data: any) => {
        if (this.configurationService.get('ENABLE_FEATURE_SUBSCRIPTION')) {
          const valueMap = this.encodedDataSourceMap;

          if (isExportMode) {
            for (const dataSource of this.configurationService.get(
              'DATA_SOURCES_dexfolio_DATA_PROVIDER'
            )) {
              valueMap[dataSource] = 'DEXFOLIO';
            }
          }

          data = redactPaths({
            valueMap,
            object: data,
            paths: [
              'activities[*].dataSource',
              'activities[*].SymbolProfile.dataSource',
              'benchmarks[*].dataSource',
              'errors[*].dataSource',
              'fearAndGreedIndex.CRYPTOCURRENCIES.dataSource',
              'fearAndGreedIndex.STOCKS.dataSource',
              'holdings[*].assetProfile.dataSource',
              'holdings[*].dataSource',
              'items[*].dataSource',
              'SymbolProfile.dataSource',
              'watchlist[*].dataSource'
            ]
          });
        }

        return data;
      })
    );
  }
}
