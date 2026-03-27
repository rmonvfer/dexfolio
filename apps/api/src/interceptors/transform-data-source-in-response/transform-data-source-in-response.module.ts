import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';
import { ConfigurationService } from '@dexfolio/api/services/configuration/configuration.service';

import { Module } from '@nestjs/common';

@Module({
  exports: [ConfigurationService],
  imports: [ConfigurationModule],
  providers: [ConfigurationService]
})
export class TransformDataSourceInResponseModule { }
