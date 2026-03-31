export const EtherscanServiceMock = {
  getEthBalance: jest.fn().mockResolvedValue('2000000000000000000'),
  getNormalTransactions: jest.fn().mockResolvedValue([]),
  getErc20Transfers: jest.fn().mockResolvedValue([])
};
