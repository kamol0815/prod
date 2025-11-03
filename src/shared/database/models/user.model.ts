import mongoose, { Document, Schema } from 'mongoose';
import { IPlanDocument } from './plans.model';

const SubscriptionType = {
  SUBSCRIPTION: 'subscription',
  ONETIME: 'onetime',
};

export interface IUserDocument extends Document {
  telegramId: number;
  username?: string;
  subscriptionType: string;
  subscriptionStart: Date;
  subscriptionEnd: Date;
  isActive: boolean;
  hasReceivedFreeBonus: boolean;
  hadPaidSubscriptionBeforeBonus: boolean;
  freeBonusReceivedAt?: Date;
  plans: IPlanDocument[];
  isKickedOut: boolean;
  activeInviteLink?: string;
}

const userSchema = new Schema({
  telegramId: { type: Number, required: true, unique: true },
  username: { type: String },
  subscriptionType: { type: String, enum: Object.values(SubscriptionType) },
  subscriptionStart: { type: Date, required: false },
  subscriptionEnd: { type: Date, required: false },
  isActive: { type: Boolean, default: false },
  hasReceivedFreeBonus: { type: Boolean, default: false },
  freeBonusReceivedAt: { type: Date },
  hadPaidSubscriptionBeforeBonus: { type: Boolean, default: false },
  plans: [{ type: Schema.Types.ObjectId, ref: 'Plan' }],
  isKickedOut: { type: Boolean, default: false },
  activeInviteLink: { type: String },
});

userSchema.index({ telegramId: 1, isActive: 1 });
userSchema.index({ subscriptionEnd: 1 });

export const UserModel = mongoose.model<IUserDocument>('User', userSchema);
