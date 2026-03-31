import { AccountModule } from '@dexfolio/api/app/account/account.module';
import { EtherscanModule } from '@dexfolio/api/services/etherscan/etherscan.module';
import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';
import { TokenMappingModule } from '@dexfolio/api/services/token-mapping/token-mapping.module';

import { Module } from '@nestjs/common';

import { WalletSyncService } from './wallet-sync.service';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  controllers: [WalletController],
  exports: [WalletService, WalletSyncService],
  imports: [AccountModule, EtherscanModule, PrismaModule, TokenMappingModule],
  providers: [WalletService, WalletSyncService]
})
export class WalletModule {}
