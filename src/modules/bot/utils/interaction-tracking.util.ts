import { config } from '../../../shared/config';
import { createSignedToken, verifySignedToken } from '../../../shared/utils/signed-token.util';

export type TrackableLinkType = 'terms' | 'uzcard';

interface TrackingTokenPayload {
  telegramId: number;
  type: TrackableLinkType;
}

export function createTrackingToken(telegramId: number, type: TrackableLinkType): string {
  return createSignedToken<TrackingTokenPayload>(
    { telegramId, type },
    config.PAYMENT_LINK_SECRET,
  );
}

export function verifyTrackingToken(token: string): TrackingTokenPayload {
  return verifySignedToken<TrackingTokenPayload>(token, config.PAYMENT_LINK_SECRET);
}
