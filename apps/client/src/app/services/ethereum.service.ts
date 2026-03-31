import { Injectable } from '@angular/core';

export class EthereumProviderNotFoundError extends Error {
  public constructor() {
    super(
      'No Ethereum provider found. Please install MetaMask or another wallet extension.'
    );
    this.name = 'EthereumProviderNotFoundError';
  }
}

@Injectable({
  providedIn: 'root'
})
export class EthereumService {
  private get provider() {
    const provider = window.ethereum;

    if (!provider) {
      throw new EthereumProviderNotFoundError();
    }

    return provider;
  }

  public async requestAccounts(): Promise<string[]> {
    return this.provider.request<string[]>({
      method: 'eth_requestAccounts'
    });
  }

  public async personalSign(message: string, address: string): Promise<string> {
    return this.provider.request<string>({
      method: 'personal_sign',
      params: [message, address]
    });
  }
}
