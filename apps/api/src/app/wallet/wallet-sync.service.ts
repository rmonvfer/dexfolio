import { PortfolioChangedEvent } from '@dexfolio/api/events/portfolio-changed.event';
import { EtherscanService } from '@dexfolio/api/services/etherscan/etherscan.service';
import {
  Erc20Transfer,
  EtherscanTransaction
} from '@dexfolio/api/services/etherscan/interfaces';
import { PrismaService } from '@dexfolio/api/services/prisma/prisma.service';
import { TokenMappingService } from '@dexfolio/api/services/token-mapping/token-mapping.service';

import { HttpException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, Prisma } from '@prisma/client';
import { Big } from 'big.js';
import { StatusCodes } from 'http-status-codes';

@Injectable()
export class WalletSyncService {
  private static readonly BLOCKS_PER_30_DAYS = 161_280;
  private static readonly WEI_PER_ETH = new Big('1000000000000000000');

  private readonly logger = new Logger(WalletSyncService.name);

  public constructor(
    private readonly etherscanService: EtherscanService,
    private readonly eventEmitter: EventEmitter2,
    private readonly prismaService: PrismaService,
    private readonly tokenMappingService: TokenMappingService
  ) {}

  public async syncWallet(walletConnectionId: string): Promise<void> {
    const walletConnection =
      await this.prismaService.walletConnection.findUnique({
        include: { account: true },
        where: { id: walletConnectionId }
      });

    if (!walletConnection) {
      throw new HttpException(
        'Wallet connection not found.',
        StatusCodes.NOT_FOUND
      );
    }

    if (!walletConnection.accountId) {
      throw new HttpException(
        'Wallet connection is not linked to an account.',
        StatusCodes.BAD_REQUEST
      );
    }

    const { accountId, address, lastSyncedBlock, userId } = walletConnection;

    let startBlock: number;

    if (lastSyncedBlock === 0) {
      const currentBlock = await this.etherscanService.getBlockNumber();
      startBlock = Math.max(
        1,
        currentBlock - WalletSyncService.BLOCKS_PER_30_DAYS
      );
    } else {
      startBlock = lastSyncedBlock + 1;
    }

    this.logger.log(
      `Syncing wallet ${address} from block ${startBlock} for user ${userId}`
    );

    const [normalTransactions, erc20Transfers] = await Promise.all([
      this.etherscanService.getNormalTransactions(address, startBlock),
      this.etherscanService.getErc20Transfers(address, startBlock)
    ]);

    const successfulTransactions = normalTransactions.filter(
      (tx) => tx.isError === '0'
    );

    let highestBlock = lastSyncedBlock === 0 ? startBlock - 1 : lastSyncedBlock;

    for (const tx of successfulTransactions) {
      const blockNumber = parseInt(tx.blockNumber, 10);

      if (blockNumber > highestBlock) {
        highestBlock = blockNumber;
      }
    }

    for (const transfer of erc20Transfers) {
      const blockNumber = parseInt(transfer.blockNumber, 10);

      if (blockNumber > highestBlock) {
        highestBlock = blockNumber;
      }
    }

    await this.prismaService.$transaction(async (prisma) => {
      for (const ethTx of successfulTransactions) {
        await this.processEthTransaction({
          accountId,
          prisma,
          tx: ethTx,
          userId,
          walletAddress: address
        });
      }

      for (const transfer of erc20Transfers) {
        await this.processErc20Transfer({
          accountId,
          prisma,
          transfer,
          userId,
          walletAddress: address
        });
      }

      await prisma.walletConnection.update({
        data: { lastSyncedBlock: highestBlock },
        where: { id: walletConnectionId }
      });
    });

    this.logger.log(
      `Synced wallet ${address}: ${successfulTransactions.length} ETH txs, ${erc20Transfers.length} ERC-20 transfers. New lastSyncedBlock: ${highestBlock}`
    );

    this.eventEmitter.emit(
      PortfolioChangedEvent.getName(),
      new PortfolioChangedEvent({ userId })
    );
  }

  private async processErc20Transfer({
    accountId,
    prisma,
    transfer,
    userId,
    walletAddress
  }: {
    accountId: string;
    prisma: Prisma.TransactionClient;
    transfer: Erc20Transfer;
    userId: string;
    walletAddress: string;
  }): Promise<void> {
    const coinGeckoId = await this.tokenMappingService.getCoinGeckoId(
      transfer.contractAddress
    );

    if (!coinGeckoId) {
      this.logger.warn(
        `Skipping unknown ERC-20 token at ${transfer.contractAddress} (tx: ${transfer.hash})`
      );
      return;
    }

    const isIncoming =
      transfer.to.toLowerCase() === walletAddress.toLowerCase();
    const decimals = parseInt(transfer.tokenDecimal, 10);
    const quantity = new Big(transfer.value)
      .div(new Big(10).pow(decimals))
      .toNumber();
    const date = new Date(parseInt(transfer.timeStamp, 10) * 1000);

    await prisma.order.create({
      data: {
        comment: `Wallet sync: ${transfer.hash}`,
        date,
        fee: 0,
        quantity,
        type: isIncoming ? 'BUY' : 'SELL',
        unitPrice: 0,
        account: {
          connect: {
            id_userId: { id: accountId, userId }
          }
        },
        SymbolProfile: {
          connectOrCreate: {
            create: {
              currency: 'USD',
              dataSource: DataSource.COINGECKO,
              symbol: coinGeckoId
            },
            where: {
              dataSource_symbol: {
                dataSource: DataSource.COINGECKO,
                symbol: coinGeckoId
              }
            }
          }
        },
        user: { connect: { id: userId } }
      }
    });
  }

  private async processEthTransaction({
    accountId,
    prisma,
    tx,
    userId,
    walletAddress
  }: {
    accountId: string;
    prisma: Prisma.TransactionClient;
    tx: EtherscanTransaction;
    userId: string;
    walletAddress: string;
  }): Promise<void> {
    const value = new Big(tx.value);

    if (value.eq(0)) {
      return;
    }

    const isIncoming = tx.to.toLowerCase() === walletAddress.toLowerCase();
    const quantity = value.div(WalletSyncService.WEI_PER_ETH).toNumber();
    const date = new Date(parseInt(tx.timeStamp, 10) * 1000);

    const fee = isIncoming
      ? 0
      : new Big(tx.gasUsed)
          .mul(tx.gasPrice)
          .div(WalletSyncService.WEI_PER_ETH)
          .toNumber();

    await prisma.order.create({
      data: {
        fee,
        quantity,
        comment: `Wallet sync: ${tx.hash}`,
        date,
        type: isIncoming ? 'BUY' : 'SELL',
        unitPrice: 0,
        account: {
          connect: {
            id_userId: { id: accountId, userId }
          }
        },
        SymbolProfile: {
          connectOrCreate: {
            create: {
              currency: 'USD',
              dataSource: DataSource.COINGECKO,
              symbol: 'ethereum'
            },
            where: {
              dataSource_symbol: {
                dataSource: DataSource.COINGECKO,
                symbol: 'ethereum'
              }
            }
          }
        },
        user: { connect: { id: userId } }
      }
    });
  }
}
