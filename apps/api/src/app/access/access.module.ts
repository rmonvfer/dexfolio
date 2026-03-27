import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';
import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';

import { Module } from '@nestjs/common';

import { AccessController } from './access.controller';
import { AccessService } from './access.service';

@Module({
  controllers: [AccessController],
  exports: [AccessService],
  imports: [ConfigurationModule, PrismaModule],
  providers: [AccessService]
})
export class AccessModule { }
