import { IsString } from 'class-validator';

export class ConnectWalletDto {
  @IsString()
  address: string;

  @IsString()
  signature: string;
}
