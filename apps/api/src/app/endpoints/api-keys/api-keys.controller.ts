import { HasPermission } from '@dexfolio/api/decorators/has-permission.decorator';
import { HasPermissionGuard } from '@dexfolio/api/guards/has-permission.guard';
import { ApiKeyService } from '@dexfolio/api/services/api-key/api-key.service';
import { ApiKeyResponse } from '@dexfolio/common/interfaces';
import { permissions } from '@dexfolio/common/permissions';
import type { RequestWithUser } from '@dexfolio/common/types';

import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Controller('api-keys')
export class ApiKeysController {
  public constructor(
    private readonly apiKeyService: ApiKeyService,
    @Inject(REQUEST) private readonly request: RequestWithUser
  ) { }

  @HasPermission(permissions.createApiKey)
  @Post()
  @UseGuards(AuthGuard('jwt'), HasPermissionGuard)
  public async createApiKey(): Promise<ApiKeyResponse> {
    return this.apiKeyService.create({ userId: this.request.user.id });
  }
}
