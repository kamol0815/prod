import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Query,
  Render,
} from '@nestjs/common';
import { UzcardOnetimeApiService } from './uzcard-onetime-api.service';
import {
  UzcardPaymentConfirm,
  UzcardPaymentDto,
} from './dtos/uzcard-payment.dto';
import logger from '../../../shared/utils/logger';

@Controller('uzcard-onetime-api')
export class UzcardOnetimeApiController {
  constructor(private readonly uzcardSubsApiService: UzcardOnetimeApiService) {}

  @Get('onetime-payment')
  @Header('Content-Type', 'text/html')
  @Render('uzcard-onetime/payment-card-insert')
  renderPaymentPage(
    @Query('userId') userId: string,
    @Query('planId') planId: string,
    @Query('selectedService') selectedService: string,
  ) {
    logger.warn(`Selected sport: ${selectedService}`);
    return {
      userId,
      planId,
      selectedService,
    };
  }

  @Get('confirm-onetime-payment')
  @Render('uzcard-onetime/sms-code-confirm')
  renderSmsVerificationPage(
    @Query('session') session: string,
    @Query('phone') phone: string,
    @Query('userId') userId: string,
    @Query('planId') planId: string,
    @Query('selectedService') selectedService: string,
  ) {
    return {
      session,
      phone,
      userId,
      planId,
      selectedService,
    };
  }

  @Post('payment')
  async paymentWithoutRegistration(@Body() requestBody: UzcardPaymentDto) {
    try {
      logger.warn(
        `Selected sport in paymentWithoutRegistration in UzcardSubsApiController : ${requestBody.planId}`,
      );
      return await this.uzcardSubsApiService.paymentWithoutRegistration(
        requestBody,
      );
    } catch (error) {
      // @ts-ignore
      return {
        success: false,
        // @ts-ignore
        errorCode: error.code || 'unknown_error',
        // @ts-ignore
        message:
          error.message ||
          "Kutilmagan xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.",
      };
    }
  }

  @Post('confirm-payment')
  async confirmPaymentWithoutRegistration(
    @Body() requestBody: UzcardPaymentConfirm,
  ) {
    try {
      logger.warn(
        `Selected sport in confirmPaymentWithoutRegistration in UzcardSubsApiController : ${requestBody.selectedService}`,
      );
      return await this.uzcardSubsApiService.confirmPaymentWithoutRegistration(
        requestBody,
      );
    } catch (error) {
      // @ts-ignore
      return {
        success: false,
        // @ts-ignore
        errorCode: error.code || 'unknown_error',
        // @ts-ignore
        message:
          error.message ||
          "Kutilmagan xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.",
      };
    }
  }

  @Get('resend-otp')
  async resendCode(
    @Query('session') session: string,
    @Query('userId') userId: string,
  ) {
    return await this.uzcardSubsApiService.resendCode(session, userId);
  }
}
