import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClickRequest } from './types/click-request.type';
import { ClickAction, ClickError } from './enums';
import logger from '../../../shared/utils/logger';
import { generateMD5 } from '../../../shared/utils/hashing/hasher.helper';
import {
  Transaction,
  TransactionStatus,
} from '../../../shared/database/models/transactions.model';
import { UserModel } from '../../../shared/database/models/user.model';
import { BotService } from '../../bot/bot.service';
import { Plan } from '../../../shared/database/models/plans.model';

type TransactionContext = {
  planId?: string;
  userId?: string;
};

function parseMerchantTransactionId(value?: string): TransactionContext {
  if (!value) {
    return {};
  }

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch (error) {
    logger.warn('Failed to decodeURIComponent for merchant_trans_id', {
      merchant_trans_id: value,
      error,
    });
  }

  const [planId, userId] = decoded.split('.');

  return {
    planId: planId || undefined,
    userId: userId || undefined,
  };
}

function hasActiveSubscription(user?: {
  isActive?: boolean;
  subscriptionEnd?: Date | null;
}): boolean {
  if (!user || !user.isActive || !user.subscriptionEnd) {
    return false;
  }

  const subscriptionEnd =
    user.subscriptionEnd instanceof Date
      ? user.subscriptionEnd
      : new Date(user.subscriptionEnd);

  return subscriptionEnd.getTime() > Date.now();
}

@Injectable()
export class ClickService {
  private readonly secretKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly botService: BotService,
  ) {
    const secretKey = this.configService.get<string>('CLICK_SECRET');
    if (!secretKey) {
      throw new Error('CLICK_SECRET is not defined in the configuration');
    }
    this.secretKey = secretKey;
  }

  async handleMerchantTransactions(clickReqBody: ClickRequest) {
    const actionType = +clickReqBody.action;
    clickReqBody.amount = parseFloat(clickReqBody.amount + '');

    logger.info(
      `Handling merchant transaction with action type: ${actionType}`,
    );

    switch (actionType) {
      case ClickAction.Prepare:
        return this.prepare(clickReqBody);
      case ClickAction.Complete:
        return this.complete(clickReqBody);
      default:
        return {
          error: ClickError.ActionNotFound,
          error_note: 'Invalid action',
        };
    }
  }
   
  async prepare(clickReqBody: ClickRequest) {
    logger.info('Preparing transaction', { clickReqBody });

    const merchantTransId = clickReqBody.merchant_trans_id;
    const context = parseMerchantTransactionId(merchantTransId);
    const planId = context.planId ?? merchantTransId;
    const merId = merchantTransId;
    const userId = clickReqBody.param2 ?? context.userId;
    const amount = clickReqBody.amount;

    if (!userId) {
      logger.error('Click prepare received without userId', {
        merchant_trans_id: merchantTransId,
        context,
      });
      return {
        error: ClickError.UserNotFound,
        error_note: 'Invalid userId',
      };
    }

    const transId = clickReqBody.click_trans_id + '';
    const signString = clickReqBody.sign_string;
    const signTime = new Date(clickReqBody.sign_time).toISOString();

    const myMD5Params = {
      clickTransId: transId,
      serviceId: clickReqBody.service_id,
      secretKey: this.secretKey,
      merchantTransId: merId,
      amount: amount,
      action: clickReqBody.action,
      signTime: clickReqBody.sign_time,
    };

    const myMD5Hash = generateMD5(myMD5Params);

    if (signString !== myMD5Hash) {
      logger.warn('Signature validation failed', { transId });
      return {
        error: ClickError.SignFailed,
        error_note: 'Invalid sign_string',
      };
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return {
        error: ClickError.UserNotFound,
        error_note: 'Invalid userId',
      };
    }

    if (hasActiveSubscription(user)) {
      return {
        error: ClickError.AlreadyPaid,
        error_note: 'User already has an active subscription',
      };
    }

    // Check if the transaction already exists and is not in a PENDING state
    const existingTransaction = await Transaction.findOne({
      transId: transId,
      status: { $ne: TransactionStatus.PENDING },
    });

    if (existingTransaction) {
      return {
        error: ClickError.AlreadyPaid,
        error_note: 'Transaction already processed',
      };
    }

    // Create a new transaction only if it doesn't exist or is in a PENDING state
    const time = new Date().getTime();
    await Transaction.create({
      provider: 'click',
      planId,
      userId,
      signTime,
      transId,
      prepareId: time,
      status: TransactionStatus.PENDING,
      amount: clickReqBody.amount,
      createdAt: new Date(time),
    });

    return {
      click_trans_id: +transId,
      merchant_trans_id: planId,
      merchant_prepare_id: time,
      error: ClickError.Success,
      error_note: 'Success',
    };
  }

  async complete(clickReqBody: ClickRequest) {
    logger.info('Completing transaction', { clickReqBody });

    const merchantTransId = clickReqBody.merchant_trans_id;
    const context = parseMerchantTransactionId(merchantTransId);
    const planId = context.planId ?? merchantTransId;
    const merId = merchantTransId;
    const userId = clickReqBody.param2 ?? context.userId;
    const prepareId = clickReqBody.merchant_prepare_id;
    const transId = clickReqBody.click_trans_id + '';
    const serviceId = clickReqBody.service_id;
    const amount = clickReqBody.amount;

    if (!userId) {
      logger.error('Click complete received without userId', {
        merchant_trans_id: merchantTransId,
        context,
      });
      return {
        error: ClickError.UserNotFound,
        error_note: 'Invalid userId',
      };
    }

    const signTime = clickReqBody.sign_time;
    const error = clickReqBody.error;
    const signString = clickReqBody.sign_string;

    const myMD5Params = {
      clickTransId: transId,
      serviceId,
      secretKey: this.secretKey,
      merchantTransId: merId,
      merchantPrepareId: prepareId,
      amount,
      action: clickReqBody.action,
      signTime,
    };

    const myMD5Hash = generateMD5(myMD5Params);

    if (signString !== myMD5Hash) {
      return {
        error: ClickError.SignFailed,
        error_note: 'Invalid sign_string',
      };
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return {
        error: ClickError.UserNotFound,
        error_note: 'Invalid userId',
      };
    }

    if (hasActiveSubscription(user)) {
      await Transaction.findOneAndUpdate(
        { transId },
        {
          status: TransactionStatus.CANCELED,
          cancelTime: new Date(),
        },
      );

      return {
        error: ClickError.AlreadyPaid,
        error_note: 'User already has an active subscription',
      };
    }

    const plan = await Plan.findById(planId);

    if (!plan) {
      return {
        error: ClickError.UserNotFound,
        error_note: 'Invalid planId',
      };
    }

    const isPrepared = await Transaction.findOne({
      prepareId,
      userId,
      planId,
    });

    if (!isPrepared) {
      return {
        error: ClickError.TransactionNotFound,
        error_note: 'Invalid merchant_prepare_id',
      };
    }

    const isAlreadyPaid = await Transaction.findOne({
      planId,
      prepareId,
      status: TransactionStatus.PAID,
    });

    if (isAlreadyPaid) {
      return {
        error: ClickError.AlreadyPaid,
        error_note: 'Already paid',
      };
    }

    if (parseInt(`${amount}`) !== plan.price) {
      return {
        error: ClickError.InvalidAmount,
        error_note: 'Invalid amount',
      };
    }

    const transaction = await Transaction.findOne({
      transId,
    });

    if (transaction && transaction.status === TransactionStatus.CANCELED) {
      return {
        error: ClickError.TransactionCanceled,
        error_note: 'Already cancelled',
      };
    }

    if (error > 0) {
      await Transaction.findOneAndUpdate(
        { transId: transId },
        { status: TransactionStatus.FAILED },
      );
      return {
        error: error,
        error_note: 'Failed',
      };
    }

    await Transaction.findOneAndUpdate(
      { transId: transId },
      { status: TransactionStatus.PAID },
    );
    if (transaction) {
      try {
        const user = await UserModel.findById(transaction.userId).exec();
        if (user) {
          await this.botService.handlePaymentSuccess(
            transaction.userId.toString(),
            user.telegramId,
            user.username,
          );
        }
      } catch (error) {
        logger.error('Error handling payment success:', error);
        // Continue with the response even if notification fails
      }
    }

    return {
      click_trans_id: +transId,
      merchant_trans_id: planId,
      error: ClickError.Success,
      error_note: 'Success',
    };
  }
}
