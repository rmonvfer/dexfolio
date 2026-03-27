import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';
import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';
import { PropertyModule } from '@dexfolio/api/services/property/property.module';

import { Module } from '@nestjs/common';

import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
  imports: [ConfigurationModule, PrismaModule, PropertyModule],
  providers: [SubscriptionService]
})
export class SubscriptionModule { }
