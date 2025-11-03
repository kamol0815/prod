import mongoose, { Document } from 'mongoose';

export interface IUserPaymentDocument extends Document {
  user: mongoose.Schema.Types.ObjectId;
  subscription: mongoose.Schema.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: Date;
}

const userPaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserSubscription',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
userPaymentSchema.index({ user: 1, status: 1 });
userPaymentSchema.index({ subscription: 1 });
userPaymentSchema.index({ transactionId: 1 });

export const UserPayment = mongoose.model<IUserPaymentDocument>(
  'UserPayment',
  userPaymentSchema,
);
