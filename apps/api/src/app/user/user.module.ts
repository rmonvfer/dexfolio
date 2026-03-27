import { ActivitiesModule } from '@dexfolio/api/app/activities/activities.module';
import { SubscriptionModule } from '@dexfolio/api/app/subscription/subscription.module';
import { RedactValuesInResponseModule } from '@dexfolio/api/interceptors/redact-values-in-response/redact-values-in-response.module';
import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';
import { I18nModule } from '@dexfolio/api/services/i18n/i18n.module';
import { ImpersonationModule } from '@dexfolio/api/services/impersonation/impersonation.module';
import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';
import { PropertyModule } from '@dexfolio/api/services/property/property.module';
import { TagModule } from '@dexfolio/api/services/tag/tag.module';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  exports: [UserService],
  imports: [
    ActivitiesModule,
    ConfigurationModule,
    I18nModule,
    ImpersonationModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '30 days' }
    }),
    PrismaModule,
    PropertyModule,
    RedactValuesInResponseModule,
    SubscriptionModule,
    TagModule
  ],
  providers: [UserService]
})
export class UserModule { }
