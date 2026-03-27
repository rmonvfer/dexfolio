import { PrismaService } from '@dexfolio/api/services/prisma/prisma.service';
import { hasPermission, permissions } from '@dexfolio/common/permissions';
import type { RequestWithUser } from '@dexfolio/common/types';

import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class ImpersonationService {
  public constructor(
    private readonly prismaService: PrismaService,
    @Inject(REQUEST) private readonly request: RequestWithUser
  ) { }

  public async validateImpersonationId(aId = '') {
    if (this.request.user) {
      const accessObject = await this.prismaService.access.findFirst({
        where: {
          granteeUserId: this.request.user.id,
          id: aId
        }
      });

      if (accessObject?.userId) {
        return accessObject.userId;
      } else if (
        hasPermission(
          this.request.user.permissions,
          permissions.impersonateAllUsers
        )
      ) {
        return aId;
      }
    } else {
      // Public access
      const accessObject = await this.prismaService.access.findFirst({
        where: {
          granteeUserId: null,
          user: { id: aId }
        }
      });

      if (accessObject?.userId) {
        return accessObject.userId;
      }
    }

    return null;
  }
}
