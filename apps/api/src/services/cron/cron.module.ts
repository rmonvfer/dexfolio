import { UserModule } from '@dexfolio/api/app/user/user.module';
import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';
import { ExchangeRateDataModule } from '@dexfolio/api/services/exchange-rate-data/exchange-rate-data.module';
import { PropertyModule } from '@dexfolio/api/services/property/property.module';
import { DataGatheringModule } from '@dexfolio/api/services/queues/data-gathering/data-gathering.module';
import { TwitterBotModule } from '@dexfolio/api/services/twitter-bot/twitter-bot.module';

import { Module } from '@nestjs/common';

import { CronService } from './cron.service';

@Module({
  imports: [
    ConfigurationModule,
    DataGatheringModule,
    ExchangeRateDataModule,
    PropertyModule,
    TwitterBotModule,
    UserModule
  ],
  providers: [CronService]
})
export class CronModule { }
