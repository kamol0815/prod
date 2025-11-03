import { Module } from '@nestjs/common';
import { PaymeService } from './payme.service';
import { PaymeController } from './payme.controller';
import { BotModule } from '../../bot/bot.module';

@Module({
  controllers: [PaymeController],
  providers: [PaymeService],
  imports: [BotModule],
})
export class PaymeModule {}
