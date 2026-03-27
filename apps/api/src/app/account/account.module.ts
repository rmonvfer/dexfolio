import { AccountBalanceModule } from '@dexfolio/api/app/account-balance/account-balance.module';
import { PortfolioModule } from '@dexfolio/api/app/portfolio/portfolio.module';
import { RedactValuesInResponseModule } from '@dexfolio/api/interceptors/redact-values-in-response/redact-values-in-response.module';
import { ApiModule } from '@dexfolio/api/services/api/api.module';
import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';
import { ExchangeRateDataModule } from '@dexfolio/api/services/exchange-rate-data/exchange-rate-data.module';
import { ImpersonationModule } from '@dexfolio/api/services/impersonation/impersonation.module';
import { PrismaModule } from '@dexfolio/api/services/prisma/prisma.module';

import { Module } from '@nestjs/common';

import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  controllers: [AccountController],
  exports: [AccountService],
  imports: [
    AccountBalanceModule,
    ApiModule,
    ConfigurationModule,
    ExchangeRateDataModule,
    ImpersonationModule,
    PortfolioModule,
    PrismaModule,
    RedactValuesInResponseModule
  ],
  providers: [AccountService]
})
export class AccountModule { }
