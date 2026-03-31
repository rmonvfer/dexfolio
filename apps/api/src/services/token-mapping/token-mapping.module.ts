import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';

import { Module } from '@nestjs/common';

import { TokenMappingService } from './token-mapping.service';

@Module({
  exports: [TokenMappingService],
  imports: [ConfigurationModule],
  providers: [TokenMappingService]
})
export class TokenMappingModule {}
