import { SymbolModule } from '@dexfolio/api/app/symbol/symbol.module';
import { BenchmarkModule } from '@dexfolio/api/services/benchmark/benchmark.module';
import { ConfigurationModule } from '@dexfolio/api/services/configuration/configuration.module';
import { TwitterBotService } from '@dexfolio/api/services/twitter-bot/twitter-bot.service';

import { Module } from '@nestjs/common';

@Module({
  exports: [TwitterBotService],
  imports: [BenchmarkModule, ConfigurationModule, SymbolModule],
  providers: [TwitterBotService]
})
export class TwitterBotModule { }
