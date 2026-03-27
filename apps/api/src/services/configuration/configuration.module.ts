import { ConfigurationService } from '@dexfolio/api/services/configuration/configuration.service';

import { Module } from '@nestjs/common';

@Module({
  providers: [ConfigurationService],
  exports: [ConfigurationService]
})
export class ConfigurationModule { }
