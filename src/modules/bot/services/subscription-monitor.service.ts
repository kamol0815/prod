import { Bot, Context, InlineKeyboard, SessionFlavor } from 'grammy';
import { config, SubscriptionType } from '../../../shared/config';
import {
  IUserDocument,
  UserModel,
} from '../../../shared/database/models/user.model';
import logger from '../../../shared/utils/logger';

interface SessionData {
  pendingSubscription?: {
    type: SubscriptionType;
  };
}

type BotContext = Context & SessionFlavor<SessionData>;

export class SubscriptionMonitorService {
  private bot: Bot<BotContext>;

  constructor(bot: Bot<BotContext>) {
    this.bot = bot;
  }

  async checkExpiringSubscriptions(): Promise<void> {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Find users whose subscriptions expire in 3 days and are still active
    const expiringUsers = await UserModel.find({
      subscriptionEnd: {
        $gte: new Date(),
        $lte: threeDaysFromNow,
      },
      isActive: true,
    });

    for (const user of expiringUsers) {
      await this.sendExpirationWarning(user);
    }
  }

  async handleExpiredSubscriptions(): Promise<void> {
    const now = new Date();

    // Find users whose subscriptions have expired but haven't been kicked
    const expiredUsers = await UserModel.find({
      subscriptionEnd: { $lt: now },
      isActive: true,
      isKickedOut: false,
    });

    for (const user of expiredUsers) {
      await this.handleExpiredUser(user);
    }
  }

  private async sendExpirationWarning(user: IUserDocument): Promise<void> {
    try {
      const daysLeft = Math.ceil(
        (user.subscriptionEnd.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      );

      const keyboard = new InlineKeyboard()
        .text('🔄 Obunani yangilash', 'renew')
        .row()
        .text('📊 Obuna holati', 'check_status');

      const message =
        `⚠️ Ogohlantirish!\n\n` +
        `Sizning obunangiz ${daysLeft} kundan so'ng tugaydi.\n` +
        `Agar obunani yangilamasangiz, kanal a'zoligidan chiqarilasiz.\n\n` +
        `Obunani yangilash uchun quyidagi tugmani bosing:`;

      await this.bot.api.sendMessage(user.telegramId, message, {
        reply_markup: keyboard,
      });

      logger.info(`Sent expiration warning to user ${user.telegramId}`);
    } catch (error) {
      logger.error(
        `Error sending expiration warning to user ${user.telegramId}:`,
        error,
      );
    }
  }

  private async handleExpiredUser(user: IUserDocument): Promise<void> {
    try {
      if (user.activeInviteLink) {
        try {
          await this.bot.api.revokeChatInviteLink(
            config.CHANNEL_ID,
            user.activeInviteLink,
          );
          logger.info('Revoked invite link for expired user', {
            telegramId: user.telegramId,
          });
        } catch (error) {
          logger.warn('Failed to revoke invite link for expired user', {
            telegramId: user.telegramId,
            error,
          });
        }

        user.activeInviteLink = undefined;
      }

      // Ban foydalanuvchini kanalga qayta kirishdan to'liq to'sish uchun
      await this.bot.api.banChatMember(config.CHANNEL_ID, user.telegramId);

      // Update user status
      user.isActive = false;
      user.isKickedOut = true;
      await user.save();

      const keyboard = new InlineKeyboard()
        .text("🎯 Qayta obuna bo'lish", 'subscribe')
        .row()
        .text('📊 Obuna holati', 'check_status');

      const message =
        `❌ Sizning obunangiz muddati tugadi va siz kanaldan chiqarildingiz.\n\n` +
        `Qayta obuna bo'lish uchun quyidagi tugmani bosing:`;

      await this.bot.api.sendMessage(user.telegramId, message, {
        reply_markup: keyboard,
      });

      logger.info(`Handled expired subscription for user ${user.telegramId}`);
    } catch (error) {
      logger.error(`Error handling expired user ${user.telegramId}:`, error);
    }
  }
}
