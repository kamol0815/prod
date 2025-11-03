import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ClickRequest } from './types/click-request.type';
import { ClickService } from './click.service';
import logger from '../../../shared/utils/logger';

@Controller('click')
export class ClickController {
  constructor(private readonly clickService: ClickService) {
    console.log('ClickController initialized');
  }

  @Post('')
  @HttpCode(HttpStatus.OK)
  async handleMerchantTransactions(@Body() clickReqBody: ClickRequest) {
    logger.info(`clickReqBody: ${JSON.stringify(clickReqBody)}`);
    return await this.clickService.handleMerchantTransactions(clickReqBody);
  }
}
