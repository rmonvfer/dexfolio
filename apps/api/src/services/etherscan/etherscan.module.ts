import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';

import { Module } from '@nestjs/common';

import { EtherscanService } from './etherscan.service';

@Module({
  exports: [EtherscanService],
  imports: [ConfigurationModule],
  providers: [EtherscanService]
})
export class EtherscanModule {}
