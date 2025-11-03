import { Body, Controller, Get, Header, Post, Query, Render, HttpException, BadRequestException } from '@nestjs/common';
import { SubscriptionManagementService } from './subscription-management.service';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { config } from 'src/shared/config';
import { verifySignedToken } from 'src/shared/utils/signed-token.util';

@Controller('subscription')
export class SubscriptionManagementController {
  constructor(
    private readonly subscriptionManagementService: SubscriptionManagementService,
  ) {}

  @Get('cancel')
  @Header('Content-Type', 'text/html')
  @Render('subscription/cancel')
  showCancellationForm(@Query('token') token?: string) {
    const telegramId = this.parseToken(token);
    return {
      status: null,
      message: null,
      form: {
        telegramId,
      },
      token,
    };
  }

  @Get('terms')
  @Header('Content-Type', 'text/html')
  @Render('subscription/terms')
  showTermsPage() {
    return {
      cancellationLink: this.subscriptionManagementService.getCancellationLink(),
    };
  }

  @Post('cancel')
  @Header('Content-Type', 'text/html')
  @Render('subscription/cancel')
  async handleCancellation(@Body() body: CancelSubscriptionDto, @Query('token') token?: string) {
    let parsedTelegramId: string | undefined;
    try {
      parsedTelegramId = this.parseToken(token);
      if (!parsedTelegramId) {
        throw new BadRequestException('Bekor qilish havolasi noto‘g‘ri.');
      }

      const result =
        await this.subscriptionManagementService.cancelSubscription({ telegramId: parsedTelegramId });
      return {
        status: 'success',
        message: result.message,
        form: {},
        token,
      };
    } catch (error) {
      let message = 'Nomaʼlum xatolik yuz berdi. Keyinroq urinib ko‘ring.';

      if (error instanceof HttpException) {
        const response = error.getResponse();
        if (typeof response === 'string') {
          message = response;
        } else if (
          typeof response === 'object' &&
          response &&
          'message' in response
        ) {
          const detailed = Array.isArray(response['message'])
            ? response['message'][0]
            : response['message'];
          message = detailed ?? message;
        }
      }

      return {
        status: 'error',
        message,
        form: {
          telegramId: parsedTelegramId ?? body.telegramId,
        },
        token,
      };
    }
  }

  private parseToken(token?: string): string | undefined {
    if (!token) {
      return undefined;
    }

    try {
      const payload = verifySignedToken<{ telegramId: string | number }>(token, config.PAYMENT_LINK_SECRET);
      return String(payload.telegramId);
    } catch (error) {
      throw new BadRequestException('Bekor qilish havolasi eskirgan yoki noto‘g‘ri.');
    }
  }
}
