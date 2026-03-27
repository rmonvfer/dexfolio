import { ImpersonationService } from '@dexfolio/api/services/impersonation/impersonation.service';
import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';

import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  providers: [ImpersonationService],
  exports: [ImpersonationService]
})
export class ImpersonationModule { }
