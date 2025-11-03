import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { BotInteractionStatsModel } from '../../../shared/database/models/bot-interaction-stats.model';
import { UZCARD_FREE_TRIAL_BASE_URL } from '../../../shared/constants/bot-links.constant';
import { TrackableLinkType, verifyTrackingToken } from '../utils/interaction-tracking.util';
import logger from '../../../shared/utils/logger';

const TERMS_TARGET = 'https://telegra.ph/Yulduzlar-Bashorati--OMMAVIY-OFERTA-10-29';

@Controller('bot/redirect')
export class BotTrackingController {
  @Get('terms')
  async redirectToTerms(@Query('token') token: string, @Res() res: Response): Promise<void> {
    const payload = this.safeVerifyToken(token, 'terms');

    if (payload) {
      await this.recordInteraction(payload.telegramId, { openedTerms: true });
    }

    res.redirect(TERMS_TARGET);
  }

  @Get('uzcard')
  async redirectToUzcard(
    @Query('token') token: string,
    @Query('userId') userId: string,
    @Query('planId') planId: string,
    @Query('selectedService') selectedService: string,
    @Res() res: Response
  ): Promise<void> {
    const payload = this.safeVerifyToken(token, 'uzcard');

    if (payload) {
      await this.recordInteraction(payload.telegramId, { openedUzcard: true });
    }

    // Build the final URL with parameters
    const finalUrl = `${UZCARD_FREE_TRIAL_BASE_URL}?userId=${userId}&planId=${planId}&selectedService=${selectedService}`;
    res.redirect(finalUrl);
  }

  private safeVerifyToken(token: string | undefined, expectedType: TrackableLinkType) {
    if (!token) {
      return null;
    }

    try {
      const payload = verifyTrackingToken(token);
      if (payload.type !== expectedType || !payload.telegramId) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  private async recordInteraction(
    telegramId: number,
    updates: Partial<Record<'openedTerms' | 'openedUzcard', boolean>>,
  ): Promise<void> {
    const setUpdates: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        setUpdates[key] = true;
      }
    }

    if (!Object.keys(setUpdates).length) {
      return;
    }

    try {
      await BotInteractionStatsModel.findOneAndUpdate(
        { telegramId },
        {
          $setOnInsert: { telegramId },
          $set: setUpdates,
        },
        { upsert: true, new: true },
      ).exec();
    } catch (error) {
      logger.warn('Failed to record tracked redirect interaction', {
        telegramId,
        updates: setUpdates,
        error,
      });
    }
  }
}
