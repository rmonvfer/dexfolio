import {
  EthereumProviderNotFoundError,
  EthereumService
} from '@dexfolio/client/services/ethereum.service';
import { WalletConnection } from '@dexfolio/common/interfaces';
import { DataService } from '@dexfolio/ui/services';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ConnectWalletDialogParams } from './interfaces/interfaces';

type DialogStep = 'connect' | 'signing' | 'success' | 'error';

const SLOW_CONNECTION_TIMEOUT_MS = 20_000;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'h-100' },
  imports: [MatButtonModule, MatDialogModule, MatProgressSpinnerModule],
  selector: 'gf-connect-wallet-dialog',
  styleUrls: ['./connect-wallet-dialog.scss'],
  templateUrl: 'connect-wallet-dialog.html'
})
export class GfConnectWalletDialogComponent implements OnDestroy {
  public connectedAddress: string;
  public createdAccountId: string;
  public errorMessage: string;
  public isMetaMaskMissing = false;
  public isSlowConnection = false;
  public step: DialogStep = 'connect';

  private slowConnectionTimer: ReturnType<typeof setTimeout>;

  public constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: ConnectWalletDialogParams,
    public dialogRef: MatDialogRef<GfConnectWalletDialogComponent>,
    private ethereumService: EthereumService
  ) {}

  public ngOnDestroy() {
    this.clearSlowConnectionTimer();
  }

  public onCancel() {
    this.clearSlowConnectionTimer();
    this.dialogRef.close();
  }

  public async onConnect() {
    try {
      this.step = 'signing';
      this.isSlowConnection = false;
      this.startSlowConnectionTimer();
      this.changeDetectorRef.markForCheck();

      const accounts = await this.ethereumService.requestAccounts();
      const address = accounts[0];
      this.connectedAddress = address;

      this.dataService.generateWalletNonce(address).subscribe({
        error: (error) => {
          this.clearSlowConnectionTimer();
          this.errorMessage = this.getServerErrorMessage(
            error,
            'Failed to prepare wallet verification.'
          );
          this.step = 'error';
          this.changeDetectorRef.markForCheck();
        },
        next: async ({ message }) => {
          try {
            const signature = await this.ethereumService.personalSign(
              message,
              address
            );

            this.dataService.connectWallet({ address, signature }).subscribe({
              error: (connectError) => {
                this.clearSlowConnectionTimer();
                this.errorMessage = this.getConnectErrorMessage(connectError);
                this.step = 'error';
                this.changeDetectorRef.markForCheck();
              },
              next: (walletConnection: WalletConnection) => {
                this.clearSlowConnectionTimer();
                this.createdAccountId = walletConnection.accountId;
                this.step = 'success';
                this.changeDetectorRef.markForCheck();
              }
            });
          } catch (signError) {
            this.clearSlowConnectionTimer();
            this.errorMessage = this.getSignatureErrorMessage(signError);
            this.step = 'error';
            this.changeDetectorRef.markForCheck();
          }
        }
      });
    } catch (error) {
      this.clearSlowConnectionTimer();

      if (error instanceof EthereumProviderNotFoundError) {
        this.isMetaMaskMissing = true;
        this.step = 'connect';
      } else {
        this.errorMessage = this.getWalletErrorMessage(error);
        this.step = 'error';
      }

      this.changeDetectorRef.markForCheck();
    }
  }

  public onDone() {
    this.dialogRef.close({
      accountId: this.createdAccountId,
      connected: true
    });
  }

  public onViewAccount() {
    this.dialogRef.close({
      accountId: this.createdAccountId,
      connected: true,
      viewAccount: true
    });
  }

  public onRetry() {
    this.step = 'connect';
    this.isMetaMaskMissing = false;
    this.isSlowConnection = false;
    this.errorMessage = '';
    this.changeDetectorRef.markForCheck();
  }

  private clearSlowConnectionTimer() {
    if (this.slowConnectionTimer) {
      clearTimeout(this.slowConnectionTimer);
      this.slowConnectionTimer = undefined;
    }
  }

  private getConnectErrorMessage(error: any): string {
    const status = error?.status;
    if (status === 409) {
      return 'This wallet is already connected to another account.';
    }

    return this.getServerErrorMessage(error, 'Failed to connect wallet.');
  }

  private getServerErrorMessage(error: any, fallback: string): string {
    const status = error?.status;
    const serverMessage = error?.error?.message;

    if (serverMessage) {
      return serverMessage;
    }

    if (status === 0 || status === undefined) {
      return 'Unable to reach the server. Please check your network connection.';
    }

    return fallback;
  }

  private getSignatureErrorMessage(error: any): string {
    if (error?.code === 4001) {
      return 'Signature request was rejected.';
    }

    return 'Failed to sign the verification message.';
  }

  private getWalletErrorMessage(error: any): string {
    if (error?.code === 4001) {
      return 'Wallet connection was rejected.';
    }

    if (error?.code === -32002) {
      return 'A connection request is already pending. Please check your wallet extension.';
    }

    return error?.message ?? 'Failed to connect to wallet.';
  }

  private startSlowConnectionTimer() {
    this.clearSlowConnectionTimer();

    this.slowConnectionTimer = setTimeout(() => {
      if (this.step === 'signing') {
        this.isSlowConnection = true;
        this.changeDetectorRef.markForCheck();
      }
    }, SLOW_CONNECTION_TIMEOUT_MS);
  }
}
