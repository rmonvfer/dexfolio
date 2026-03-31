import { WalletModule } from '@dexfolio/api/app/wallet/wallet.module';
import { WALLET_SYNC_QUEUE } from '@dexfolio/common/config';

import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { WalletSyncProcessor } from './wallet-sync.processor';
import { WalletSyncQueueService } from './wallet-sync.service';

@Module({
  exports: [WalletSyncQueueService],
  imports: [
    BullModule.registerQueue({
      name: WALLET_SYNC_QUEUE
    }),
    WalletModule
  ],
  providers: [WalletSyncProcessor, WalletSyncQueueService]
})
export class WalletSyncModule {}
