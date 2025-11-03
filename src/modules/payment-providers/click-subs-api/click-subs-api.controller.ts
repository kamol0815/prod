import { Controller, Get, Post, Body, Patch, Param, Delete, Header, Render, Query } from '@nestjs/common';
import { ClickSubsApiService } from './click-subs-api.service';
import { CreateCardTokenResponseDto } from 'src/shared/utils/types/interfaces/click-types-interface';
import { CreateCardTokenDto } from './dto/create-card-dto';
import { VerifyCardTokenDto } from './dto/verif-card-dto';

@Controller('click-subs-api')
export class ClickSubsApiController {
  constructor(private readonly clickSubsApiService: ClickSubsApiService) { }



  @Get('/payment')
  @Header('Content-Type', 'text/html')
  @Render('click/payment-card-insert')
  renderPaymentPage(
    @Query('userId') userId: string,
    @Query('planId') planId: string,
    @Query('selectedService') selectedService: string
    // @Query('telegramId') telegramId: number
  ) {
    return {
      userId,
      planId,
      selectedService
    };
  }
  @Get('/verify-sms')
  @Render('click/sms-code-confirm')
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


  @Post('/create-card-token')
  async createCardToken(@Body() requestBody: CreateCardTokenDto): Promise<CreateCardTokenResponseDto> {
    return await this.clickSubsApiService.createCardtoken(requestBody);
  }

  @Post('/verify-card-token/')
  async verifyCardToken(@Body() requestBody: VerifyCardTokenDto) {
    return await this.clickSubsApiService.verifyCardToken(requestBody);
  }

}
