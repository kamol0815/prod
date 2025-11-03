import { Document, model, Schema } from 'mongoose';

export interface IBotInteractionStats extends Document {
  telegramId: number;
  started: boolean;
  clickedFreeTrial: boolean;
  openedTerms: boolean;
  openedUzcard: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BotInteractionStatsSchema = new Schema<IBotInteractionStats>(
  {
    telegramId: { type: Number, required: true, unique: true },
    started: { type: Boolean, default: false },
    clickedFreeTrial: { type: Boolean, default: false },
    openedTerms: { type: Boolean, default: false },
    openedUzcard: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

export const BotInteractionStatsModel = model<IBotInteractionStats>(
  'BotInteractionStats',
  BotInteractionStatsSchema,
);
