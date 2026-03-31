import {
  WALLET_SYNC_PROCESS_JOB_NAME,
  WALLET_SYNC_QUEUE
} from '@dexfolio/common/config';

import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class WalletSyncQueueService {
  private readonly logger = new Logger(WalletSyncQueueService.name);

  public constructor(
    @InjectQueue(WALLET_SYNC_QUEUE)
    private readonly walletSyncQueue: Queue
  ) {}

  public async addSyncJob(walletConnectionId: string): Promise<void> {
    await this.walletSyncQueue.add(
      WALLET_SYNC_PROCESS_JOB_NAME,
      { walletConnectionId },
      {
        attempts: 3,
        backoff: {
          delay: 60000,
          type: 'exponential'
        },
        jobId: `wallet-sync-${walletConnectionId}`,
        removeOnComplete: true,
        removeOnFail: false
      }
    );

    this.logger.log(`Queued wallet sync job for ${walletConnectionId}`);
  }
}
