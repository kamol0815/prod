import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { ClickModule } from '../payment-providers/click/click.module';
import { PaymeModule } from '../payment-providers/payme/payme.module';
import { BotTrackingController } from './controllers/bot-tracking.controller';

@Module({
  controllers: [BotTrackingController],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
