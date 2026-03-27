import { UpdateMarketDataDto } from '@dexfolio/common/dtos';

import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray } from 'class-validator';

export class UpdateBulkMarketDataDto {
  @ArrayNotEmpty()
  @IsArray()
  @Type(() => UpdateMarketDataDto)
  marketData: UpdateMarketDataDto[];
}
