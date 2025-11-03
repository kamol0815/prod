import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { CardType, IUserCardsDocument, UserCardsModel } from 'src/shared/database/models/user-cards.model';
import { UserModel } from 'src/shared/database/models/user.model';
import { UserSubscription } from 'src/shared/database/models/user-subscription.model';
import logger from 'src/shared/utils/logger';
import { PaymeSubsApiService } from '../payment-providers/payme-subs-api/payme-subs-api.service';
import { ClickSubsApiService } from '../payment-providers/click-subs-api/click-subs-api.service';
import { UzcardOnetimeApiService } from '../payment-providers/uzcard-onetime-api/uzcard-onetime-api.service';
import { buildSubscriptionManagementLink, buildSubscriptionCancellationLink } from 'src/shared/utils/payment-link.util';

@Injectable()
export class SubscriptionManagementService {
  constructor(
    private readonly paymeSubsApiService: PaymeSubsApiService,
    private readonly clickSubsApiService: ClickSubsApiService,
    private readonly uzcardOnetimeApiService: UzcardOnetimeApiService,
  ) {}

  async cancelSubscription(dto: CancelSubscriptionDto) {
    const telegramId = this.parseTelegramId(dto.telegramId);

    const user = await UserModel.findOne({ telegramId });
    if (!user) {
      throw new NotFoundException(
        'Foydalanuvchi topilmadi. Telegram ID raqamini tekshiring.',
      );
    }

    const cards = await UserCardsModel.find({
      userId: user._id,
      isDeleted: { $ne: true },
    }).exec();

    for (const card of cards) {
      const providerRemoved = await this.removeProviderCard(card);
      if (!providerRemoved) {
        logger.warn(
          `Provider removal failed for user ${user._id} cardType=${card.cardType}`,
        );
      }

      card.isDeleted = true;
      card.deletedAt = new Date();
      await card.save();
    }

    await UserSubscription.updateMany(
      { user: user._id, isActive: true },
      {
        isActive: false,
        autoRenew: false,
        status: 'cancelled',
        endDate: new Date(),
      },
    );

    user.isActive = false;
    user.subscriptionEnd = new Date();
    await user.save();

    logger.info(`Subscription cancelled for telegramId=${telegramId}`);

    return {
      success: true,
      message: 'Obuna muvaffaqiyatli bekor qilindi.',
    };
  }

  getCancellationLink(): string | undefined {
    return this.resolveCancellationLink();
  }

  buildCancellationUrlForUser(telegramId: number | string): string | undefined {
    return buildSubscriptionCancellationLink(telegramId);
  }

  private parseTelegramId(input: string): number {
    const digitsOnly = input?.replace(/\D/g, '');
    if (!digitsOnly) {
      throw new BadRequestException('Telegram ID raqamini to‘liq kiriting.');
    }

    const parsed = Number(digitsOnly);
    if (!Number.isFinite(parsed)) {
      throw new BadRequestException('Telegram ID noto‘g‘ri formatda.');
    }

    return parsed;
  }

  private async removeProviderCard(card: IUserCardsDocument): Promise<boolean> {
    switch (card.cardType) {
      case CardType.PAYME:
        return this.paymeSubsApiService.removeCard(card.cardToken);
      case CardType.CLICK:
        return this.clickSubsApiService.deleteCard(card.cardToken);
      case CardType.UZCARD:
        return this.uzcardOnetimeApiService.deleteCard(
          card.userId.toString(),
        );
      default:
        logger.error(`Unsupported card type for cancellation: ${card.cardType}`);
        return false;
    }
  }

  private resolveCancellationLink(): string | undefined {
    const link = buildSubscriptionManagementLink('subscription/cancel');
    return link;
  }
}
