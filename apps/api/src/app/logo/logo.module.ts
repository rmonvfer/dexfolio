import { TransformDataSourceInRequestModule } from '@dexfolio/api/interceptors/transform-data-source-in-request/transform-data-source-in-request.module';
import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';
import { SymbolProfileModule } from '@dexfolio/api/services/symbol-profile/symbol-profile.module';

import { Module } from '@nestjs/common';

import { LogoController } from './logo.controller';
import { LogoService } from './logo.service';

@Module({
  controllers: [LogoController],
  imports: [
    ConfigurationModule,
    SymbolProfileModule,
    TransformDataSourceInRequestModule
  ],
  providers: [LogoService]
})
export class LogoModule { }
