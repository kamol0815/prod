import {Body, Controller, Get, Header, Post, Query, Render} from '@nestjs/common';
import {join} from "path";
import logger from 'src/shared/utils/logger';
import { PaymeSubsApiService } from './payme-subs-api.service';
import { CreateCardTokenPaymeDto } from './dto/create-card-dto';
import { VerifyCardTokenPaymeDtoDto } from './dto/verify-card-dto';

@Controller('payme-subs-api')
export class PaymeSubsApiController {

  constructor(private readonly paymeSubsApiService: PaymeSubsApiService) {}



  @Get('/payment')
  @Header('Content-Type', 'text/html')
  @Render('payme/payment-card-insert')
  renderPaymentPage(
      @Query('userId') userId: string,
      @Query('planId') planId: string,
      @Query('selectedService') selectedService: string
  ) {
    console.log('Rendering payment page, view path:', join(process.cwd(), 'view/payme/payment-card-insert.ejs'));
    return {
      userId,
      planId,
      selectedService
    };
  }

  @Get('/verify-sms')
  @Render('payme/sms-code-confirm')
  renderSmsVerificationPage(
      @Query('token') token: string,
      @Query('phone') phone: string,
      @Query('userId') userId: string,
      @Query('planId') planId: string,
      @Query('selectedService') selectedService: string
  ) {
    return {
      token,
      phone,
      userId,
      planId,
      selectedService
    };
  }

  @Post('/card-token')
  async createCardToken(@Body() requestBody: CreateCardTokenPaymeDto): Promise<any> {
    return await this.paymeSubsApiService.createCardToken(requestBody);
  }

  @Post('/verify-token-payme')
  async verifyCardToken(@Body() requestBody: VerifyCardTokenPaymeDtoDto) {
    logger.warn(`Request body in PaymeSubsApiController: ${JSON.stringify(requestBody)}`);
    return await this.paymeSubsApiService.verifyCardToken(requestBody);
  }

  @Post('/resend-code')
  async resendCode(@Body() requestBody: any) {
    return await this.paymeSubsApiService.resendCode(requestBody);
  }

}