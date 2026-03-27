import { RedisCacheModule } from '@dexfolio/api/app/redis-cache/redis-cache.module';
import { TransformDataSourceInRequestModule } from '@dexfolio/api/interceptors/transform-data-source-in-request/transform-data-source-in-request.module';
import { DataEnhancerModule } from '@dexfolio/api/services/data-provider/data-enhancer/data-enhancer.module';
import { DataProviderModule } from '@dexfolio/api/services/data-provider/data-provider.module';
import { PropertyModule } from '@dexfolio/api/services/property/property.module';

import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  controllers: [HealthController],
  imports: [
    DataEnhancerModule,
    DataProviderModule,
    PropertyModule,
    RedisCacheModule,
    TransformDataSourceInRequestModule
  ],
  providers: [HealthService]
})
export class HealthModule { }
