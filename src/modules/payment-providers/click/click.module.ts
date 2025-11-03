import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClickController } from './click.controller';
import { ClickService } from './click.service';
import { BotModule } from '../../bot/bot.module';

@Module({
  imports: [ConfigModule, forwardRef(() => BotModule)],
  controllers: [ClickController],
  providers: [ClickService],
})
export class ClickModule {}
