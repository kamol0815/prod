import { CardType } from 'src/shared/database/models/user-cards.model';
import { IPlanDocument } from '../../../shared/database/models/plans.model';
import {
  IUserDocument,
  UserModel,
} from '../../../shared/database/models/user.model';
import logger from '../../../shared/utils/logger';
import { PaymentCardTokenDto } from 'src/shared/utils/types/interfaces/payme-types';
import { Bot } from 'grammy';
import { BotContext } from './bot-core.service';
import { PaymentService } from './payment.service';

interface SubscriptionResponse {
  user: IUserDocument;
  wasKickedOut: boolean;
  success?: boolean;

}

export class SubscriptionService {
    private bot: Bot<BotContext>;

    constructor(bot: Bot<BotContext>) {
        this.bot = bot;
    }

  async createSubscription(
    userId: string,
    plan: IPlanDocument,
    username?: string,
  ): Promise<SubscriptionResponse> {
    const existingUser = await UserModel.findById(userId).exec();

    if (!existingUser) {
      // Create new user subscription
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(now.getDate() + plan.duration);

      const subscription = new UserModel({
        userId,
        username,
        subscriptionStart: now,
        subscriptionEnd: endDate,
        isActive: true,
        planId: plan.id,
        isKickedOut: false,
      });

      const savedUser = await subscription.save();

      //todo: we should also create userSubscription here or replace that UserModel creation with that

      return {
        user: savedUser,
        wasKickedOut: false,
      };
    }

    const now = new Date();
    let endDate = new Date();

    if (existingUser.isActive) {
      endDate = new Date(existingUser.subscriptionEnd);
      endDate.setDate(endDate.getDate() + plan.duration);
    } else {
      if (existingUser.subscriptionEnd > now) {
        endDate = new Date(existingUser.subscriptionEnd);
        endDate.setDate(endDate.getDate() + plan.duration);
      } else {
        endDate.setDate(now.getDate() + plan.duration);
      }
    }

    existingUser.subscriptionStart = now;
    existingUser.subscriptionEnd = endDate;
    existingUser.isActive = true;
    existingUser.plans.push(plan);

    const wasKickedOut = existingUser.isKickedOut;
    existingUser.isKickedOut = false;

    if (username) {
      existingUser.username = username;
    }

    const savedUser = await existingUser.save();

    return {
      user: savedUser,
      wasKickedOut,
    };
  }

  async getSubscription(userId: string): Promise<IUserDocument | null> {
    return UserModel.findById(userId).exec();
  }

  async createBonusSubscription(
    userId: string,
    plan: IPlanDocument,
    bonusDays: number,
    username?: string,
    service?: 'yulduz' | 'love',
  ): Promise<SubscriptionResponse> {
    const existingUser = await UserModel.findById(userId).exec();
    logger.info(
      `Fetched user from DB for bonus subscription: ${existingUser ? 'FOUND' : 'NOT FOUND'}`,
    );

    if (!existingUser) {
      throw new Error('User must exist before receiving bonus subscription');
    }

    const now = new Date();
    let endDate = new Date();

    // Determine which subscription type to work with
    // const isWrestlingBonus = sport === 'wrestling';

    let isCurrentlyActive: boolean;
    let currentEndDate: Date | undefined;

    isCurrentlyActive =
      existingUser.isActive && existingUser.subscriptionEnd > now;
    currentEndDate = existingUser.subscriptionEnd;

    if (isCurrentlyActive && currentEndDate) {
      // Extend current subscription
      endDate = new Date(currentEndDate);
      endDate.setDate(endDate.getDate() + bonusDays);
      logger.info(
        `Extending current ${service || 'football'} subscription with bonus. Adding ${bonusDays} days. New endDate: ${endDate}`,
      );
    } else {
      // Start new subscription with bonus
      endDate.setDate(now.getDate() + bonusDays);
      logger.info(
        `Starting new ${service || 'football'} subscription with bonus of ${bonusDays} days. New endDate: ${endDate}`,
      );
    }


      existingUser.subscriptionStart = now;
      existingUser.subscriptionEnd = endDate;
      existingUser.isActive = true;


    // Common updates
    existingUser.plans.push(plan);
    existingUser.isKickedOut = false;
    existingUser.hasReceivedFreeBonus = true;
    existingUser.freeBonusReceivedAt = now;

    //TODO: you are gonna use user-subscription model so later remove this part
    if (existingUser.plans.length > 0) {
      existingUser.hadPaidSubscriptionBeforeBonus = true;
    }

    if (username) {
      existingUser.username = username;
    }

    const wasKickedOut = existingUser.isKickedOut;
    const savedUser = await existingUser.save();

    logger.info(
      `Bonus subscription created successfully for user ${userId} with ${bonusDays} days until ${endDate}`,
    );

    return { user: savedUser, wasKickedOut };
  }

  async createSubscriptionWithCard(userId: string, plan: IPlanDocument, username?: string, bonusDays?: number) {
    
        const existingUser = await UserModel.findById(userId).exec();
        logger.info(`Fetched user from DB for wrestling card subscription: FOUND`);

        const now = new Date();
        let endDate = new Date();

        // Check if user has active wrestling subscription
        const isCurrentlyActiveForWrestling = existingUser!.isActive &&
            existingUser!.subscriptionEnd &&
            existingUser!.subscriptionEnd> now;

        if (isCurrentlyActiveForWrestling) {
            // Add bonus days to current wrestling subscription end date
            endDate = new Date(existingUser!.subscriptionEnd);
            endDate.setDate(endDate.getDate() + bonusDays);
            logger.info(`Extending current wrestling subscription with bonus. Adding ${bonusDays} days. New endDate: ${endDate}`);
        } else {
            // Apply bonus days starting from today
            endDate.setDate(now.getDate() + bonusDays);
            logger.info(`Starting new wrestling subscription with bonus of ${bonusDays} days. New endDate: ${endDate}`);
        }

        // Update wrestling-specific fields
        existingUser!.subscriptionStart= now;
        existingUser!.subscriptionEnd = endDate;
        existingUser!.isActive= true;
        existingUser!.plans.push(plan);
        existingUser!.isKickedOut = false;

        // Set bonus flags
        existingUser!.hasReceivedFreeBonus = true;
        existingUser!.freeBonusReceivedAt = now;

        if (existingUser!.plans.length > 0) {
            existingUser!.hadPaidSubscriptionBeforeBonus = true;
        }


        if (username) {
            existingUser!.username = username;
        }

        const wasKickedOut = existingUser!.isKickedOut;
        const savedUser = await existingUser!.save();

        return {user: savedUser, wasKickedOut};


  }

  async renewSubscriptionWithCard(
        userId: string,
        telegramId: number,
        cardType: CardType,
        plan: IPlanDocument,
        username?: string,
        selectedSport?: string
    ): Promise<SubscriptionResponse> {
        logger.info(`Starting renewSubscriptionWithCard for userId: ${userId}, cardType: ${cardType}`);

        // Get plan information
        if (!plan) {
            logger.error('No plan found');
            throw new Error('Subscription plan not found');
        }

        const user = await this.getSubscription(userId);
        if (!user) {
            logger.error(`User not found for ID: ${userId}`);
            throw new Error('User not found');
        }

        const paymentService = new PaymentService();

        try {
            let paymentResult;

            const requestBody: PaymentCardTokenDto = {
                userId: userId,
                telegramId: telegramId,
                planId: plan._id as string,
            }

            switch (cardType) {
                case CardType.CLICK:
                    logger.info(`(Auto payment) Calling Click for userId: ${userId}, cardType: ${cardType}`);
                    const clickResult = await paymentService.paymentWithClickSubsApi(requestBody);
                    paymentResult = clickResult;
                    break;
                case CardType.PAYME:
                    logger.info(`(Auto payment) Calling Payme for userId: ${userId}, cardType: ${cardType}`);
                    paymentResult = await paymentService.paymentWithPaymeSubsApi(requestBody);
                    break;
                // case CardType.UZCARD:
                //     logger.info(`(Auto payment) Calling Uzcard for userId: ${userId}, cardType: ${cardType}`);
                //     paymentResult = await paymentService.paymentWithUzcardSubsApi(requestBody);
                    break;
                default:
                    throw new Error(`Unsupported card type: ${cardType}`);
            }


            if (!paymentResult) {
                logger.error(`Payment result is false for userId: ${userId}, cardType: ${cardType}`);

                const message = `❌ Avtomatik to'lov amalga oshmadi!\n\n` +
                    `Kartangizda mablag' yetarli emas yoki boshqa muammo yuzaga keldi.\n`;

                await this.bot.api.sendMessage(
                    user.telegramId,
                    message
                );
                logger.info(`Sent failed payment notification to user ${user.telegramId}`);
                return {user,wasKickedOut: false, success: false};
            }

            let subscriptionResponse: SubscriptionResponse;

          
                subscriptionResponse = await this.createSubscription(
                    userId,
                    plan,
                    username,
                );
            

            logger.info(`Subscription renewed successfully for user ${userId} until`);


            // @ts-ignore
            if (cardType === CardType.UZCARD && paymentResult.qrCodeUrl) {
                await this.bot.api.sendMessage(
                    telegramId,
                    `🧾 To'lov uchun chek tayyor!\n\nChekni quyidagi tugma orqali ko'rishingiz mumkin.`,
                    {
                        // @ts-ignore
                        reply_markup: new InlineKeyboard().url("🧾 Chekni ko'rish", paymentResult.qrCodeUrl),
                        parse_mode: "HTML"
                    }
                );
            }



            return {
                ...subscriptionResponse!,
                success: true,
            };
        } catch (error) {
            logger.error(`Failed to renew subscription with card for user ${userId}:`, error);
            throw error;
        }
    }

}
