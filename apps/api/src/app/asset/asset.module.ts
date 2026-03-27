import { AdminModule } from '@dexfolio/api/app/admin/admin.module';
import { TransformDataSourceInRequestModule } from '@dexfolio/api/interceptors/transform-data-source-in-request/transform-data-source-in-request.module';
import { TransformDataSourceInResponseModule } from '@dexfolio/api/interceptors/transform-data-source-in-response/transform-data-source-in-response.module';

import { Module } from '@nestjs/common';

import { AssetController } from './asset.controller';

@Module({
  controllers: [AssetController],
  imports: [
    AdminModule,
    TransformDataSourceInRequestModule,
    TransformDataSourceInResponseModule
  ]
})
export class AssetModule { }
