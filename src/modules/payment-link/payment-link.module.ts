import { Module } from '@nestjs/common';
import { PaymentLinkController } from './payment-link.controller';

@Module({
  controllers: [PaymentLinkController],
})
export class PaymentLinkModule {}
