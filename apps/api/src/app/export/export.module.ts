import { AccountModule } from '@dexfolio/api/app/account/account.module';
import { ActivitiesModule } from '@dexfolio/api/app/activities/activities.module';
import { TransformDataSourceInRequestModule } from '@dexfolio/api/interceptors/transform-data-source-in-request/transform-data-source-in-request.module';
import { ApiModule } from '@dexfolio/api/services/api/api.module';
import { MarketDataModule } from '@dexfolio/api/services/market-data/market-data.module';
import { TagModule } from '@dexfolio/api/services/tag/tag.module';

import { Module } from '@nestjs/common';

import { ExportController } from './export.controller';
import { ExportService } from './export.service';

@Module({
  controllers: [ExportController],
  imports: [
    AccountModule,
    ActivitiesModule,
    ApiModule,
    MarketDataModule,
    TagModule,
    TransformDataSourceInRequestModule
  ],
  providers: [ExportService]
})
export class ExportModule { }
