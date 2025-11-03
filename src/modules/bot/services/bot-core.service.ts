import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Bot, Context, session, SessionFlavor } from 'grammy';
import { config } from '../../../shared/config';
import logger from '../../../shared/utils/logger';

interface SessionData {
  pendingSubscription?: {
    type: string;
  };
  hasAgreedToTerms?: boolean;
}

export type BotContext = Context & SessionFlavor<SessionData>;

@Injectable()
export class BotCoreService implements OnModuleInit, OnModuleDestroy {
  public bot: Bot<BotContext>;

  constructor() {
    this.bot = new Bot<BotContext>(config.BOT_TOKEN);
    this.setupMiddleware();
  }

  async onModuleInit(): Promise<void> {
    await this.start();
  }

  async onModuleDestroy(): Promise<void> {
    await this.stop();
  }

  public async start(): Promise<void> {
    await this.bot.start({
      onStart: () => {
        logger.info('Bot started');
      },
    });
  }

  public async stop(): Promise<void> {
    logger.info('Stopping bot...');
    await this.bot.stop();
  }

  private setupMiddleware(): void {
    this.bot.use(
      session({
        initial(): SessionData {
          return {
            hasAgreedToTerms: false,
          };
        },
      }),
    );

    this.bot.use((ctx, next) => {
      logger.info(`user chatId: ${ctx.from?.id}`);
      return next();
    });

    this.bot.catch((err) => {
      logger.error('Bot error:', err);
    });
  }
}
