import { AccountService } from '@dexfolio/api/app/account/account.service';
import { PortfolioChangedEvent } from '@dexfolio/api/events/portfolio-changed.event';
import { PrismaService } from '@dexfolio/api/services/prisma/prisma.service';

import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WalletConnection } from '@prisma/client';
import { getAddress, verifyMessage } from 'ethers';
import { StatusCodes } from 'http-status-codes';
import { randomUUID } from 'node:crypto';

@Injectable()
export class WalletService {
  private static readonly ETHEREUM_WALLET_PLATFORM_URL = 'https://ethereum.org';
  private static readonly NONCE_EXPIRY_MS = 15 * 60 * 1000;
  private static readonly SIWE_DOMAIN = 'dexfolio.app';
  private static readonly SIWE_STATEMENT = 'Sign in to Dexfolio';
  private static readonly SIWE_URI = 'https://dexfolio.app';

  public constructor(
    private readonly accountService: AccountService,
    private readonly eventEmitter: EventEmitter2,
    private readonly prismaService: PrismaService
  ) {}

  public async connectWallet({
    address,
    signature,
    userId
  }: {
    address: string;
    signature: string;
    userId: string;
  }): Promise<WalletConnection> {
    const normalizedAddress = address.toLowerCase();

    const existing = await this.prismaService.walletConnection.findUnique({
      where: {
        address_chainId: {
          address: normalizedAddress,
          chainId: 1
        }
      }
    });

    if (!existing || existing.userId !== userId) {
      throw new HttpException(
        'Wallet nonce not found. Generate a nonce first.',
        StatusCodes.BAD_REQUEST
      );
    }

    if (!existing.nonce) {
      throw new HttpException(
        'Wallet already connected.',
        StatusCodes.CONFLICT
      );
    }

    if (
      existing.nonceCreatedAt &&
      Date.now() - existing.nonceCreatedAt.getTime() >
        WalletService.NONCE_EXPIRY_MS
    ) {
      await this.prismaService.walletConnection.update({
        data: { nonce: null, nonceCreatedAt: null },
        where: { id: existing.id }
      });

      throw new HttpException(
        'Nonce has expired. Please generate a new nonce.',
        StatusCodes.BAD_REQUEST
      );
    }

    const checksumAddress = getAddress(normalizedAddress);
    const message = WalletService.buildSiweMessage({
      address: checksumAddress,
      chainId: existing.chainId,
      issuedAt: existing.nonceCreatedAt,
      nonce: existing.nonce
    });
    const recoveredAddress = verifyMessage(message, signature).toLowerCase();

    if (recoveredAddress !== normalizedAddress) {
      throw new HttpException(
        'Signature verification failed.',
        StatusCodes.UNAUTHORIZED
      );
    }

    if (existing.accountId) {
      const walletConnection = await this.prismaService.walletConnection.update(
        {
          data: {
            nonce: null,
            nonceCreatedAt: null,
            syncEnabled: true
          },
          where: { id: existing.id }
        }
      );

      return walletConnection;
    }

    const platform = await this.prismaService.platform.upsert({
      create: {
        name: 'Ethereum Wallet',
        url: WalletService.ETHEREUM_WALLET_PLATFORM_URL
      },
      update: {},
      where: { url: WalletService.ETHEREUM_WALLET_PLATFORM_URL }
    });

    const truncatedAddress = `0x${normalizedAddress.slice(2, 6)}...${normalizedAddress.slice(-4)}`;

    const existingAccounts = await this.prismaService.account.findMany({
      where: { name: truncatedAddress, userId }
    });

    const account =
      existingAccounts.length > 0
        ? existingAccounts[0]
        : await this.accountService.createAccount(
            {
              balance: 0,
              currency: 'USD',
              name: truncatedAddress,
              platform: { connect: { id: platform.id } },
              user: { connect: { id: userId } }
            },
            userId
          );

    const walletConnection = await this.prismaService.walletConnection.update({
      data: {
        accountId: account.id,
        nonce: null,
        nonceCreatedAt: null,
        syncEnabled: true
      },
      where: { id: existing.id }
    });

    return walletConnection;
  }

  public async disconnectWallet({
    userId,
    walletConnectionId
  }: {
    userId: string;
    walletConnectionId: string;
  }): Promise<void> {
    const walletConnection =
      await this.prismaService.walletConnection.findUnique({
        where: { id: walletConnectionId }
      });

    if (!walletConnection || walletConnection.userId !== userId) {
      throw new HttpException(
        'Wallet connection not found.',
        StatusCodes.NOT_FOUND
      );
    }

    await this.prismaService.walletConnection.delete({
      where: { id: walletConnectionId }
    });

    this.eventEmitter.emit(
      PortfolioChangedEvent.getName(),
      new PortfolioChangedEvent({ userId })
    );
  }

  public async generateNonce({
    address,
    userId
  }: {
    address: string;
    userId: string;
  }): Promise<{ message: string; nonce: string }> {
    const normalizedAddress = address.toLowerCase();

    const existing = await this.prismaService.walletConnection.findUnique({
      where: {
        address_chainId: {
          address: normalizedAddress,
          chainId: 1
        }
      }
    });

    if (existing && existing.userId !== userId && existing.accountId) {
      throw new HttpException(
        'This wallet is already connected to another account.',
        StatusCodes.CONFLICT
      );
    }

    const nonce = randomUUID();
    const nonceCreatedAt = new Date();
    const chainId = 1;

    await this.prismaService.walletConnection.upsert({
      create: {
        address: normalizedAddress,
        chainId,
        nonce,
        nonceCreatedAt,
        userId
      },
      update: { nonce, nonceCreatedAt },
      where: {
        address_chainId: {
          address: normalizedAddress,
          chainId
        }
      }
    });

    const checksumAddress = getAddress(normalizedAddress);
    const message = WalletService.buildSiweMessage({
      address: checksumAddress,
      chainId,
      issuedAt: nonceCreatedAt,
      nonce
    });

    return { message, nonce };
  }

  private static buildSiweMessage({
    address,
    chainId,
    issuedAt,
    nonce
  }: {
    address: string;
    chainId: number;
    issuedAt: Date;
    nonce: string;
  }): string {
    return [
      `${WalletService.SIWE_DOMAIN} wants you to sign in with your Ethereum account:`,
      address,
      '',
      WalletService.SIWE_STATEMENT,
      '',
      `URI: ${WalletService.SIWE_URI}`,
      `Version: 1`,
      `Chain ID: ${chainId}`,
      `Nonce: ${nonce}`,
      `Issued At: ${issuedAt.toISOString()}`
    ].join('\n');
  }

  public async getWalletConnectionById(id: string): Promise<WalletConnection> {
    return this.prismaService.walletConnection.findUnique({
      where: { id }
    });
  }

  public async getWalletConnections(
    userId: string
  ): Promise<WalletConnection[]> {
    return this.prismaService.walletConnection.findMany({
      where: { userId }
    });
  }
}
