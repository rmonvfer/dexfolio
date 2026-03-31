import { WalletSyncService } from '@dexfolio/api/app/wallet/wallet-sync.service';
import {
  WALLET_SYNC_PROCESS_JOB_NAME,
  WALLET_SYNC_QUEUE
} from '@dexfolio/common/config';

import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';

@Injectable()
@Processor(WALLET_SYNC_QUEUE)
export class WalletSyncProcessor {
  private readonly logger = new Logger(WalletSyncProcessor.name);

  public constructor(private readonly walletSyncService: WalletSyncService) {}

  @Process({ concurrency: 1, name: WALLET_SYNC_PROCESS_JOB_NAME })
  public async processWalletSync(
    job: Job<{ walletConnectionId: string }>
  ): Promise<void> {
    const { walletConnectionId } = job.data;

    this.logger.log(`Processing wallet sync job for ${walletConnectionId}`);

    try {
      await this.walletSyncService.syncWallet(walletConnectionId);

      this.logger.log(`Wallet sync job completed for ${walletConnectionId}`);
    } catch (error) {
      this.logger.error(
        `Wallet sync job failed for ${walletConnectionId}: ${error.message}`
      );
      throw error;
    }
  }
}
