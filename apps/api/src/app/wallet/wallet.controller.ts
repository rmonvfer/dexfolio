import { HasPermission } from '@dexfolio/api/decorators/has-permission.decorator';
import { HasPermissionGuard } from '@dexfolio/api/guards/has-permission.guard';
import {
  ConnectWalletDto,
  GenerateWalletNonceDto
} from '@dexfolio/common/dtos';
import { permissions } from '@dexfolio/common/permissions';
import type { RequestWithUser } from '@dexfolio/common/types';

import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Post,
  UseGuards
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { WalletConnection } from '@prisma/client';

import { WalletSyncService } from './wallet-sync.service';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  public constructor(
    @Inject(REQUEST) private readonly request: RequestWithUser,
    private readonly walletService: WalletService,
    private readonly walletSyncService: WalletSyncService
  ) {}

  @Post('nonce')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(AuthGuard('jwt'), ThrottlerGuard)
  public async generateNonce(
    @Body() body: GenerateWalletNonceDto
  ): Promise<{ message: string; nonce: string }> {
    return this.walletService.generateNonce({
      address: body.address,
      userId: this.request.user.id
    });
  }

  @HasPermission(permissions.enableWalletConnect)
  @Post('connect')
  @UseGuards(AuthGuard('jwt'), HasPermissionGuard)
  public async connectWallet(
    @Body() body: ConnectWalletDto
  ): Promise<WalletConnection> {
    return this.walletService.connectWallet({
      address: body.address,
      signature: body.signature,
      userId: this.request.user.id
    });
  }

  @Post(':id/sync')
  @UseGuards(AuthGuard('jwt'))
  public async syncWallet(@Param('id') id: string): Promise<void> {
    const walletConnection =
      await this.walletService.getWalletConnectionById(id);

    if (!walletConnection || walletConnection.userId !== this.request.user.id) {
      throw new ForbiddenException('Wallet connection not found.');
    }

    return this.walletSyncService.syncWallet(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  public async disconnectWallet(@Param('id') id: string): Promise<void> {
    return this.walletService.disconnectWallet({
      userId: this.request.user.id,
      walletConnectionId: id
    });
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  public async getWalletConnections(): Promise<WalletConnection[]> {
    return this.walletService.getWalletConnections(this.request.user.id);
  }
}
