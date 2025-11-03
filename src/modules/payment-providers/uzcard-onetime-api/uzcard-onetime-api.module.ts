import { Module } from '@nestjs/common';
import { UzcardOnetimeApiService } from './uzcard-onetime-api.service';
import { UzcardOnetimeApiController } from './uzcard-onetime-api.controller';
import { BotModule } from '../../bot/bot.module';

@Module({
  imports: [BotModule],
  controllers: [UzcardOnetimeApiController],
  providers: [UzcardOnetimeApiService],
  exports: [UzcardOnetimeApiService],
})
export class UzcardOnetimeApiModule {}
