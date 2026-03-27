import { PlatformModule } from '@dexfolio/api/app/platform/platform.module';
import { RedisCacheModule } from '@dexfolio/api/app/redis-cache/redis-cache.module';
import { SubscriptionModule } from '@dexfolio/api/app/subscription/subscription.module';
import { UserModule } from '@dexfolio/api/app/user/user.module';
import { TransformDataSourceInResponseModule } from '@dexfolio/api/interceptors/transform-data-source-in-response/transform-data-source-in-response.module';
import { BenchmarkModule } from '@dexfolio/api/services/benchmark/benchmark.module';
import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';
import { DataProviderModule } from '@dexfolio/api/services/data-provider/data-provider.module';
import { ExchangeRateDataModule } from '@dexfolio/api/services/exchange-rate-data/exchange-rate-data.module';
import { PropertyModule } from '@dexfolio/api/services/property/property.module';
import { DataGatheringModule } from '@dexfolio/api/services/queues/data-gathering/data-gathering.module';
import { SymbolProfileModule } from '@dexfolio/api/services/symbol-profile/symbol-profile.module';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { InfoController } from './info.controller';
import { InfoService } from './info.service';

@Module({
  controllers: [InfoController],
  imports: [
    BenchmarkModule,
    ConfigurationModule,
    DataGatheringModule,
    DataProviderModule,
    ExchangeRateDataModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '30 days' }
    }),
    PlatformModule,
    PropertyModule,
    RedisCacheModule,
    SubscriptionModule,
    SymbolProfileModule,
    TransformDataSourceInResponseModule,
    UserModule
  ],
  providers: [InfoService]
})
export class InfoModule { }
