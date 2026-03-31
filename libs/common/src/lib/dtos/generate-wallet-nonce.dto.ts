import { IsString } from 'class-validator';

export class GenerateWalletNonceDto {
  @IsString()
  address: string;
}
