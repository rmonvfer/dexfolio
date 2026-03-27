import { RedisCacheService } from '@dexfolio/api/app/redis-cache/redis-cache.service';
import { HasPermission } from '@dexfolio/api/decorators/has-permission.decorator';
import { HasPermissionGuard } from '@dexfolio/api/guards/has-permission.guard';
import { permissions } from '@dexfolio/common/permissions';

import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('cache')
export class CacheController {
  public constructor(private readonly redisCacheService: RedisCacheService) { }

  @HasPermission(permissions.accessAdminControl)
  @Post('flush')
  @UseGuards(AuthGuard('jwt'), HasPermissionGuard)
  public async flushCache(): Promise<void> {
    await this.redisCacheService.reset();
  }
}
