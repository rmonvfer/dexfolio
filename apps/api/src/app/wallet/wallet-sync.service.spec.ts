import { PortfolioChangedEvent } from '@dexfolio/api/events/portfolio-changed.event';
import { EtherscanService } from '@dexfolio/api/services/etherscan/etherscan.service';
import { PrismaService } from '@dexfolio/api/services/prisma/prisma.service';
import { TokenMappingService } from '@dexfolio/api/services/token-mapping/token-mapping.service';

import { EventEmitter2 } from '@nestjs/event-emitter';

import { WalletSyncService } from './wallet-sync.service';

const WALLET_ADDRESS = '0x742d35cc6634c0532925a3b844bc9e7595f2bd38';

const mockOrderCreate = jest.fn();
const mockWalletConnectionUpdate = jest.fn();

const mockTransactionClient = {
  order: { create: mockOrderCreate },
  walletConnection: { update: mockWalletConnectionUpdate }
};

const mockPrismaService = {
  $transaction: jest.fn((fn) => fn(mockTransactionClient)),
  walletConnection: {
    findUnique: jest.fn(),
    update: jest.fn()
  }
};

const mockEtherscanService = {
  getBlockNumber: jest.fn(),
  getErc20Transfers: jest.fn(),
  getEthBalance: jest.fn(),
  getNormalTransactions: jest.fn()
};

const mockTokenMappingService = {
  getCoinGeckoId: jest.fn()
};

const mockEventEmitter = {
  emit: jest.fn()
};

describe('WalletSyncService', () => {
  let walletSyncService: WalletSyncService;

  beforeEach(() => {
    jest.clearAllMocks();

    walletSyncService = new WalletSyncService(
      mockEtherscanService as unknown as EtherscanService,
      mockEventEmitter as unknown as EventEmitter2,
      mockPrismaService as unknown as PrismaService,
      mockTokenMappingService as unknown as TokenMappingService
    );

    mockWalletConnectionUpdate.mockResolvedValue({});
    mockOrderCreate.mockResolvedValue({});
  });

  describe('syncWallet', () => {
    const walletConnection = {
      account: { id: 'account-1', userId: 'user-1' },
      accountId: 'account-1',
      address: WALLET_ADDRESS,
      id: 'wc-1',
      lastSyncedBlock: 100,
      userId: 'user-1'
    };

    it('should create BUY activity for incoming ETH transaction', async () => {
      mockPrismaService.walletConnection.findUnique.mockResolvedValue(
        walletConnection
      );

      mockEtherscanService.getNormalTransactions.mockResolvedValue([
        {
          blockNumber: '200',
          from: '0xsender',
          gas: '21000',
          gasPrice: '20000000000',
          gasUsed: '21000',
          hash: '0xtxhash1',
          isError: '0',
          timeStamp: '1625000000',
          to: WALLET_ADDRESS,
          value: '1000000000000000000'
        }
      ]);

      mockEtherscanService.getErc20Transfers.mockResolvedValue([]);

      await walletSyncService.syncWallet('wc-1');

      expect(mockOrderCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fee: 0,
            quantity: 1,
            type: 'BUY'
          })
        })
      );

      expect(mockWalletConnectionUpdate).toHaveBeenCalledWith({
        data: { lastSyncedBlock: 200 },
        where: { id: 'wc-1' }
      });
    });

    it('should create SELL activity for outgoing ETH transaction with gas fee', async () => {
      mockPrismaService.walletConnection.findUnique.mockResolvedValue(
        walletConnection
      );

      mockEtherscanService.getNormalTransactions.mockResolvedValue([
        {
          blockNumber: '200',
          from: WALLET_ADDRESS,
          gas: '21000',
          gasPrice: '20000000000',
          gasUsed: '21000',
          hash: '0xtxhash2',
          isError: '0',
          timeStamp: '1625000000',
          to: '0xreceiver',
          value: '500000000000000000'
        }
      ]);

      mockEtherscanService.getErc20Transfers.mockResolvedValue([]);

      await walletSyncService.syncWallet('wc-1');

      expect(mockOrderCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fee: 0.00042,
            quantity: 0.5,
            type: 'SELL'
          })
        })
      );
    });

    it('should filter out failed transactions', async () => {
      mockPrismaService.walletConnection.findUnique.mockResolvedValue(
        walletConnection
      );

      mockEtherscanService.getNormalTransactions.mockResolvedValue([
        {
          blockNumber: '200',
          from: '0xsender',
          gas: '21000',
          gasPrice: '20000000000',
          gasUsed: '21000',
          hash: '0xfailed',
          isError: '1',
          timeStamp: '1625000000',
          to: WALLET_ADDRESS,
          value: '1000000000000000000'
        }
      ]);

      mockEtherscanService.getErc20Transfers.mockResolvedValue([]);

      await walletSyncService.syncWallet('wc-1');

      expect(mockOrderCreate).not.toHaveBeenCalled();
    });

    it('should create BUY activity for incoming ERC-20 transfer', async () => {
      mockPrismaService.walletConnection.findUnique.mockResolvedValue(
        walletConnection
      );

      mockEtherscanService.getNormalTransactions.mockResolvedValue([]);

      mockEtherscanService.getErc20Transfers.mockResolvedValue([
        {
          blockNumber: '300',
          contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          from: '0xsender',
          hash: '0xerc20hash',
          timeStamp: '1625100000',
          to: WALLET_ADDRESS,
          tokenDecimal: '6',
          tokenName: 'USD Coin',
          tokenSymbol: 'USDC',
          value: '1000000000'
        }
      ]);

      mockTokenMappingService.getCoinGeckoId.mockResolvedValue('usd-coin');

      await walletSyncService.syncWallet('wc-1');

      expect(mockOrderCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fee: 0,
            quantity: 1000,
            type: 'BUY'
          })
        })
      );

      expect(mockWalletConnectionUpdate).toHaveBeenCalledWith({
        data: { lastSyncedBlock: 300 },
        where: { id: 'wc-1' }
      });
    });

    it('should create SELL activity for outgoing ERC-20 transfer', async () => {
      mockPrismaService.walletConnection.findUnique.mockResolvedValue(
        walletConnection
      );

      mockEtherscanService.getNormalTransactions.mockResolvedValue([]);

      mockEtherscanService.getErc20Transfers.mockResolvedValue([
        {
          blockNumber: '300',
          contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          from: WALLET_ADDRESS,
          hash: '0xerc20sell',
          timeStamp: '1625100000',
          to: '0xreceiver',
          tokenDecimal: '6',
          tokenName: 'USD Coin',
          tokenSymbol: 'USDC',
          value: '500000000'
        }
      ]);

      mockTokenMappingService.getCoinGeckoId.mockResolvedValue('usd-coin');

      await walletSyncService.syncWallet('wc-1');

      expect(mockOrderCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fee: 0,
            quantity: 500,
            type: 'SELL'
          })
        })
      );
    });

    it('should skip unrecognized ERC-20 tokens', async () => {
      mockPrismaService.walletConnection.findUnique.mockResolvedValue(
        walletConnection
      );

      mockEtherscanService.getNormalTransactions.mockResolvedValue([]);

      mockEtherscanService.getErc20Transfers.mockResolvedValue([
        {
          blockNumber: '300',
          contractAddress: '0xunknowntoken',
          from: '0xsender',
          hash: '0xunknown',
          timeStamp: '1625100000',
          to: WALLET_ADDRESS,
          tokenDecimal: '18',
          tokenName: 'Unknown Token',
          tokenSymbol: 'UNK',
          value: '1000000000000000000'
        }
      ]);

      mockTokenMappingService.getCoinGeckoId.mockResolvedValue(undefined);

      await walletSyncService.syncWallet('wc-1');

      expect(mockOrderCreate).not.toHaveBeenCalled();
    });

    it('should skip zero-value ETH transactions', async () => {
      mockPrismaService.walletConnection.findUnique.mockResolvedValue(
        walletConnection
      );

      mockEtherscanService.getNormalTransactions.mockResolvedValue([
        {
          blockNumber: '200',
          from: WALLET_ADDRESS,
          gas: '21000',
          gasPrice: '20000000000',
          gasUsed: '21000',
          hash: '0xzeroval',
          isError: '0',
          timeStamp: '1625000000',
          to: '0xcontract',
          value: '0'
        }
      ]);

      mockEtherscanService.getErc20Transfers.mockResolvedValue([]);

      await walletSyncService.syncWallet('wc-1');

      expect(mockOrderCreate).not.toHaveBeenCalled();
    });

    it('should fetch from lastSyncedBlock + 1', async () => {
      mockPrismaService.walletConnection.findUnique.mockResolvedValue(
        walletConnection
      );

      mockEtherscanService.getNormalTransactions.mockResolvedValue([]);
      mockEtherscanService.getErc20Transfers.mockResolvedValue([]);

      await walletSyncService.syncWallet('wc-1');

      expect(mockEtherscanService.getNormalTransactions).toHaveBeenCalledWith(
        WALLET_ADDRESS,
        101
      );

      expect(mockEtherscanService.getErc20Transfers).toHaveBeenCalledWith(
        WALLET_ADDRESS,
        101
      );
    });

    it('should use 30-day lookback for first sync', async () => {
      mockPrismaService.walletConnection.findUnique.mockResolvedValue({
        ...walletConnection,
        lastSyncedBlock: 0
      });

      mockEtherscanService.getBlockNumber.mockResolvedValue(20_000_000);
      mockEtherscanService.getNormalTransactions.mockResolvedValue([]);
      mockEtherscanService.getErc20Transfers.mockResolvedValue([]);

      await walletSyncService.syncWallet('wc-1');

      const expectedStartBlock = 20_000_000 - 161_280;

      expect(mockEtherscanService.getNormalTransactions).toHaveBeenCalledWith(
        WALLET_ADDRESS,
        expectedStartBlock
      );

      expect(mockEtherscanService.getErc20Transfers).toHaveBeenCalledWith(
        WALLET_ADDRESS,
        expectedStartBlock
      );
    });

    it('should emit PortfolioChangedEvent after sync', async () => {
      mockPrismaService.walletConnection.findUnique.mockResolvedValue(
        walletConnection
      );

      mockEtherscanService.getNormalTransactions.mockResolvedValue([]);
      mockEtherscanService.getErc20Transfers.mockResolvedValue([]);

      await walletSyncService.syncWallet('wc-1');

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        PortfolioChangedEvent.getName(),
        expect.any(PortfolioChangedEvent)
      );
    });

    it('should throw when wallet connection not found', async () => {
      mockPrismaService.walletConnection.findUnique.mockResolvedValue(null);

      await expect(walletSyncService.syncWallet('nonexistent')).rejects.toThrow(
        'not found'
      );
    });

    it('should throw when wallet connection has no account', async () => {
      mockPrismaService.walletConnection.findUnique.mockResolvedValue({
        ...walletConnection,
        accountId: null
      });

      await expect(walletSyncService.syncWallet('wc-1')).rejects.toThrow(
        'not linked'
      );
    });
  });
});
