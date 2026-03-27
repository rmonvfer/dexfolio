import { DataGatheringModule } from '@dexfolio/api/services/queues/data-gathering/data-gathering.module';
import { PortfolioSnapshotQueueModule } from '@dexfolio/api/services/queues/portfolio-snapshot/portfolio-snapshot.module';

import { Module } from '@nestjs/common';

import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';

@Module({
  controllers: [QueueController],
  imports: [DataGatheringModule, PortfolioSnapshotQueueModule],
  providers: [QueueService]
})
export class QueueModule { }
