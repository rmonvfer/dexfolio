export interface WalletConnection {
  id: string;
  accountId: string;
  address: string;
  chainId: number;
  lastSyncedBlock: number;
  syncEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
