import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';
import { TagModule } from '@dexfolio/api/services/tag/tag.module';

import { Module } from '@nestjs/common';

import { TagsController } from './tags.controller';

@Module({
  controllers: [TagsController],
  imports: [PrismaModule, TagModule]
})
export class TagsModule { }
