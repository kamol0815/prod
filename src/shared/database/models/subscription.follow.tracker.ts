// First, create a new model file: subscription-flow-tracker.model.ts

import mongoose, { Document, Schema } from 'mongoose';

export enum FlowStepType {
    CLICKED_AUTO_PAYMENT = 'clicked_auto_payment',
    SELECTED_PAYMENT_METHOD = 'selected_payment_method',
    ADDED_CARD = 'added_card',
    VERIFIED_CARD = 'verified_card',
    COMPLETED_SUBSCRIPTION = 'completed_auto_subscription',
    ABANDONED = 'abandoned'
}

export interface ISubscriptionFlowDocument extends Document {
    telegramId: number;
    username?: string;
    userId: mongoose.Schema.Types.ObjectId;
    step: FlowStepType;
    paymentMethod?: string; // 'click', 'uzcard', etc.
    timestamp: Date;
}

const subscriptionFlowSchema = new Schema({
    telegramId: { type: Number, required: true },
    username: { type: String },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    step: {
        type: String,
        enum: Object.values(FlowStepType),
        required: true
    },
    paymentMethod: { type: String },
    timestamp: { type: Date, default: Date.now }
});

// Add indexes for common queries
subscriptionFlowSchema.index({ telegramId: 1 });
subscriptionFlowSchema.index({ userId: 1 });
subscriptionFlowSchema.index({ step: 1 });
subscriptionFlowSchema.index({ timestamp: 1 });
subscriptionFlowSchema.index({ telegramId: 1, step: 1 });
subscriptionFlowSchema.index({ timestamp: 1, step: 1 }); // For daily statistics by step

export const SubscriptionFlowTracker = mongoose.model<ISubscriptionFlowDocument>(
    'SubscriptionFlowTracker',
    subscriptionFlowSchema
);