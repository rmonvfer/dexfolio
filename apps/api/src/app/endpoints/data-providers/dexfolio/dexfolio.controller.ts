import { HasPermission } from '@dexfolio/api/decorators/has-permission.decorator';
import { HasPermissionGuard } from '@dexfolio/api/guards/has-permission.guard';
import { AssetProfileInvalidError } from '@dexfolio/api/services/data-provider/errors/asset-profile-invalid.error';
import { parseDate } from '@dexfolio/common/helper';
import {
  DataProviderDexfolioAssetProfileResponse,
  DataProviderDexfolioStatusResponse,
  DividendsResponse,
  HistoricalResponse,
  LookupResponse,
  QuotesResponse
} from '@dexfolio/common/interfaces';
import { permissions } from '@dexfolio/common/permissions';
import { RequestWithUser } from '@dexfolio/common/types';

import {
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
  Query,
  UseGuards,
  Version
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { isISIN } from 'class-validator';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

import { GetDividendsDto } from './get-dividends.dto';
import { GetHistoricalDto } from './get-historical.dto';
import { GetQuotesDto } from './get-quotes.dto';
import { DexfolioService } from './dexfolio.service';

@Controller('data-providers/dexfolio')
export class DexfolioController {
  public constructor(
    private readonly DexfolioService: DexfolioService,
    @Inject(REQUEST) private readonly request: RequestWithUser
  ) { }

  @Get('asset-profile/:symbol')
  @HasPermission(permissions.enableDataProviderDexfolio)
  @UseGuards(AuthGuard('api-key'), HasPermissionGuard)
  public async getAssetProfile(
    @Param('symbol') symbol: string
  ): Promise<DataProviderDexfolioAssetProfileResponse> {
    const maxDailyRequests = await this.DexfolioService.getMaxDailyRequests();

    if (
      this.request.user.dataProviderdexfolioDailyRequests > maxDailyRequests
    ) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.TOO_MANY_REQUESTS),
        StatusCodes.TOO_MANY_REQUESTS
      );
    }

    try {
      const assetProfile = await this.DexfolioService.getAssetProfile({
        symbol
      });

      await this.DexfolioService.incrementDailyRequests({
        userId: this.request.user.id
      });

      return assetProfile;
    } catch (error) {
      if (error instanceof AssetProfileInvalidError) {
        throw new HttpException(
          getReasonPhrase(StatusCodes.NOT_FOUND),
          StatusCodes.NOT_FOUND
        );
      }

      throw new HttpException(
        getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('dividends/:symbol')
  @HasPermission(permissions.enableDataProviderDexfolio)
  @UseGuards(AuthGuard('api-key'), HasPermissionGuard)
  @Version('2')
  public async getDividends(
    @Param('symbol') symbol: string,
    @Query() query: GetDividendsDto
  ): Promise<DividendsResponse> {
    const maxDailyRequests = await this.DexfolioService.getMaxDailyRequests();

    if (
      this.request.user.dataProviderdexfolioDailyRequests > maxDailyRequests
    ) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.TOO_MANY_REQUESTS),
        StatusCodes.TOO_MANY_REQUESTS
      );
    }

    try {
      const dividends = await this.DexfolioService.getDividends({
        symbol,
        from: parseDate(query.from),
        granularity: query.granularity,
        to: parseDate(query.to)
      });

      await this.DexfolioService.incrementDailyRequests({
        userId: this.request.user.id
      });

      return dividends;
    } catch {
      throw new HttpException(
        getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('historical/:symbol')
  @HasPermission(permissions.enableDataProviderDexfolio)
  @UseGuards(AuthGuard('api-key'), HasPermissionGuard)
  @Version('2')
  public async getHistorical(
    @Param('symbol') symbol: string,
    @Query() query: GetHistoricalDto
  ): Promise<HistoricalResponse> {
    const maxDailyRequests = await this.DexfolioService.getMaxDailyRequests();

    if (
      this.request.user.dataProviderdexfolioDailyRequests > maxDailyRequests
    ) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.TOO_MANY_REQUESTS),
        StatusCodes.TOO_MANY_REQUESTS
      );
    }

    try {
      const historicalData = await this.DexfolioService.getHistorical({
        symbol,
        from: parseDate(query.from),
        granularity: query.granularity,
        to: parseDate(query.to)
      });

      await this.DexfolioService.incrementDailyRequests({
        userId: this.request.user.id
      });

      return historicalData;
    } catch {
      throw new HttpException(
        getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('lookup')
  @HasPermission(permissions.enableDataProviderDexfolio)
  @UseGuards(AuthGuard('api-key'), HasPermissionGuard)
  @Version('2')
  public async lookupSymbol(
    @Query('includeIndices') includeIndicesParam = 'false',
    @Query('query') query = ''
  ): Promise<LookupResponse> {
    const includeIndices = includeIndicesParam === 'true';
    const maxDailyRequests = await this.DexfolioService.getMaxDailyRequests();

    if (
      this.request.user.dataProviderdexfolioDailyRequests > maxDailyRequests
    ) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.TOO_MANY_REQUESTS),
        StatusCodes.TOO_MANY_REQUESTS
      );
    }

    try {
      const result = await this.DexfolioService.lookup({
        includeIndices,
        query: isISIN(query.toUpperCase())
          ? query.toUpperCase()
          : query.toLowerCase()
      });

      await this.DexfolioService.incrementDailyRequests({
        userId: this.request.user.id
      });

      return result;
    } catch {
      throw new HttpException(
        getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('quotes')
  @HasPermission(permissions.enableDataProviderDexfolio)
  @UseGuards(AuthGuard('api-key'), HasPermissionGuard)
  @Version('2')
  public async getQuotes(
    @Query() query: GetQuotesDto
  ): Promise<QuotesResponse> {
    const maxDailyRequests = await this.DexfolioService.getMaxDailyRequests();

    if (
      this.request.user.dataProviderdexfolioDailyRequests > maxDailyRequests
    ) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.TOO_MANY_REQUESTS),
        StatusCodes.TOO_MANY_REQUESTS
      );
    }

    try {
      const quotes = await this.DexfolioService.getQuotes({
        symbols: query.symbols
      });

      await this.DexfolioService.incrementDailyRequests({
        userId: this.request.user.id
      });

      return quotes;
    } catch {
      throw new HttpException(
        getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('status')
  @HasPermission(permissions.enableDataProviderDexfolio)
  @UseGuards(AuthGuard('api-key'), HasPermissionGuard)
  @Version('2')
  public async getStatus(): Promise<DataProviderDexfolioStatusResponse> {
    return this.DexfolioService.getStatus({ user: this.request.user });
  }
}
