import { AccountService } from '@dexfolio/api/app/account/account.service';
import { PortfolioChangedEvent } from '@dexfolio/api/events/portfolio-changed.event';
import { PrismaService } from '@dexfolio/api/services/prisma/prisma.service';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { verifyMessage } from 'ethers';

import { WalletService } from './wallet.service';

jest.mock('ethers', () => ({
  getAddress: jest.fn((addr: string) => addr),
  verifyMessage: jest.fn()
}));

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('test-nonce-uuid')
}));

const mockPrismaService = {
  account: {
    findMany: jest.fn()
  },
  platform: {
    upsert: jest.fn()
  },
  walletConnection: {
    delete: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn()
  }
};

const mockAccountService = {
  createAccount: jest.fn()
};

const mockEventEmitter = {
  emit: jest.fn()
};

describe('WalletService', () => {
  let walletService: WalletService;

  beforeEach(() => {
    jest.clearAllMocks();

    walletService = new WalletService(
      mockAccountService as unknown as AccountService,
      mockEventEmitter as unknown as EventEmitter2,
      mockPrismaService as unknown as PrismaService
    );
  });

  describe('generateNonce', () => {
    it('should generate a nonce for a new address', async () => {
      mockPrismaService.walletConnection.findUnique.mockResolvedValue(null);
      mockPrismaService.walletConnection.upsert.mockResolvedValue({
        address: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
        chainId: 1,
        nonce: 'test-nonce-uuid'
      });

      const result = await walletService.generateNonce({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38',
        userId: 'user-1'
      });

      expect(result.nonce).toEqual('test-nonce-uuid');
      expect(result.message).toContain('test-nonce-uuid');
      expect(result.message).toContain('Dexfolio');
      expect(mockPrismaService.walletConnection.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            address: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
            chainId: 1,
            nonce: 'test-nonce-uuid',
            userId: 'user-1'
          })
        })
      );
    });

    it('should throw when address is already connected to a different user', async () => {
      mockPrismaService.walletConnection.findUnique.mockResolvedValue({
        accountId: 'account-1',
        address: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
        chainId: 1,
        userId: 'other-user'
      });

      await expect(
        walletService.generateNonce({
          address: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
          userId: 'user-1'
        })
      ).rejects.toThrow('already connected to another account');
    });
  });

  describe('connectWallet', () => {
    it('should verify signature, create account and link wallet', async () => {
      const nonceCreatedAt = new Date();

      mockPrismaService.walletConnection.findUnique.mockResolvedValue({
        accountId: null,
        address: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
        chainId: 1,
        id: 'wc-1',
        nonce: 'test-nonce',
        nonceCreatedAt,
        userId: 'user-1'
      });

      (verifyMessage as jest.Mock).mockReturnValue(
        '0x742d35cc6634c0532925a3b844bc9e7595f2bd38'
      );

      mockPrismaService.platform.upsert.mockResolvedValue({
        id: 'platform-1',
        name: 'Ethereum Wallet'
      });

      mockPrismaService.account.findMany.mockResolvedValue([]);

      mockAccountService.createAccount.mockResolvedValue({
        id: 'account-1',
        name: '0x742d...2bd38',
        userId: 'user-1'
      });

      const updatedConnection = {
        accountId: 'account-1',
        address: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
        id: 'wc-1',
        nonce: null,
        syncEnabled: true,
        userId: 'user-1'
      };

      mockPrismaService.walletConnection.update.mockResolvedValue(
        updatedConnection
      );

      const result = await walletService.connectWallet({
        address: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
        signature: '0xfakesig',
        userId: 'user-1'
      });

      expect(result).toEqual(updatedConnection);
      expect(verifyMessage).toHaveBeenCalledWith(
        expect.stringContaining('test-nonce'),
        '0xfakesig'
      );
      expect(mockAccountService.createAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          balance: 0,
          currency: 'USD',
          name: expect.stringContaining('0x742d')
        }),
        'user-1'
      );
    });

    it('should reuse existing account when accountId is already set', async () => {
      const nonceCreatedAt = new Date();

      mockPrismaService.walletConnection.findUnique.mockResolvedValue({
        accountId: 'existing-account',
        address: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
        chainId: 1,
        id: 'wc-1',
        nonce: 'test-nonce',
        nonceCreatedAt,
        userId: 'user-1'
      });

      (verifyMessage as jest.Mock).mockReturnValue(
        '0x742d35cc6634c0532925a3b844bc9e7595f2bd38'
      );

      const updatedConnection = {
        accountId: 'existing-account',
        address: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
        id: 'wc-1',
        nonce: null,
        syncEnabled: true,
        userId: 'user-1'
      };

      mockPrismaService.walletConnection.update.mockResolvedValue(
        updatedConnection
      );

      const result = await walletService.connectWallet({
        address: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
        signature: '0xfakesig',
        userId: 'user-1'
      });

      expect(result).toEqual(updatedConnection);
      expect(mockAccountService.createAccount).not.toHaveBeenCalled();
    });

    it('should reuse existing account by name match', async () => {
      const nonceCreatedAt = new Date();

      mockPrismaService.walletConnection.findUnique.mockResolvedValue({
        accountId: null,
        address: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
        chainId: 1,
        id: 'wc-1',
        nonce: 'test-nonce',
        nonceCreatedAt,
        userId: 'user-1'
      });

      (verifyMessage as jest.Mock).mockReturnValue(
        '0x742d35cc6634c0532925a3b844bc9e7595f2bd38'
      );

      mockPrismaService.platform.upsert.mockResolvedValue({
        id: 'platform-1',
        name: 'Ethereum Wallet'
      });

      mockPrismaService.account.findMany.mockResolvedValue([
        { id: 'existing-account', name: '0x742d...2bd38', userId: 'user-1' }
      ]);

      const updatedConnection = {
        accountId: 'existing-account',
        address: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
        id: 'wc-1',
        nonce: null,
        syncEnabled: true,
        userId: 'user-1'
      };

      mockPrismaService.walletConnection.update.mockResolvedValue(
        updatedConnection
      );

      const result = await walletService.connectWallet({
        address: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
        signature: '0xfakesig',
        userId: 'user-1'
      });

      expect(result).toEqual(updatedConnection);
      expect(mockAccountService.createAccount).not.toHaveBeenCalled();
    });

    it('should throw when signature verification fails', async () => {
      const nonceCreatedAt = new Date();

      mockPrismaService.walletConnection.findUnique.mockResolvedValue({
        accountId: null,
        address: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
        chainId: 1,
        id: 'wc-1',
        nonce: 'test-nonce',
        nonceCreatedAt,
        userId: 'user-1'
      });

      (verifyMessage as jest.Mock).mockReturnValue(
        '0xdifferentaddress000000000000000000000000'
      );

      await expect(
        walletService.connectWallet({
          address: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
          signature: '0xbadsig',
          userId: 'user-1'
        })
      ).rejects.toThrow('Signature verification failed');
    });

    it('should throw when nonce not found', async () => {
      mockPrismaService.walletConnection.findUnique.mockResolvedValue(null);

      await expect(
        walletService.connectWallet({
          address: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
          signature: '0xsig',
          userId: 'user-1'
        })
      ).rejects.toThrow('nonce not found');
    });

    it('should throw when wallet is already connected', async () => {
      mockPrismaService.walletConnection.findUnique.mockResolvedValue({
        accountId: 'existing-account',
        address: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
        id: 'wc-1',
        nonce: null,
        userId: 'user-1'
      });

      await expect(
        walletService.connectWallet({
          address: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
          signature: '0xsig',
          userId: 'user-1'
        })
      ).rejects.toThrow('already connected');
    });
  });

  describe('disconnectWallet', () => {
    it('should delete the wallet connection', async () => {
      mockPrismaService.walletConnection.findUnique.mockResolvedValue({
        id: 'wc-1',
        userId: 'user-1'
      });

      mockPrismaService.walletConnection.delete.mockResolvedValue({
        id: 'wc-1'
      });

      await walletService.disconnectWallet({
        userId: 'user-1',
        walletConnectionId: 'wc-1'
      });

      expect(mockPrismaService.walletConnection.delete).toHaveBeenCalledWith({
        where: { id: 'wc-1' }
      });

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        PortfolioChangedEvent.getName(),
        expect.any(PortfolioChangedEvent)
      );
    });

    it('should throw when wallet connection does not belong to user', async () => {
      mockPrismaService.walletConnection.findUnique.mockResolvedValue({
        id: 'wc-1',
        userId: 'other-user'
      });

      await expect(
        walletService.disconnectWallet({
          userId: 'user-1',
          walletConnectionId: 'wc-1'
        })
      ).rejects.toThrow('not found');
    });
  });

  describe('getWalletConnections', () => {
    it('should return all wallet connections for a user', async () => {
      const connections = [
        { id: 'wc-1', address: '0xabc', userId: 'user-1' },
        { id: 'wc-2', address: '0xdef', userId: 'user-1' }
      ];

      mockPrismaService.walletConnection.findMany.mockResolvedValue(
        connections
      );

      const result = await walletService.getWalletConnections('user-1');

      expect(result).toEqual(connections);
      expect(mockPrismaService.walletConnection.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' }
      });
    });
  });
});
