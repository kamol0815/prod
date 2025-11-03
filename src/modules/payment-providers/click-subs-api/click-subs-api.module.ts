import { Module } from '@nestjs/common';
import { ClickSubsApiService } from './click-subs-api.service';
import { ClickSubsApiController } from './click-subs-api.controller';

@Module({
  controllers: [ClickSubsApiController],
  providers: [ClickSubsApiService],
  exports: [ClickSubsApiService],
})
export class ClickSubsApiModule {}
