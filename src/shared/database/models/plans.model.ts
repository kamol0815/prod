import mongoose, { Document } from 'mongoose';

export interface IPlanDocument extends Document {
  name: string;
  selectedName: string;
  duration: number;
  price: number;
  user: mongoose.Schema.Types.ObjectId;
}

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    selectedName: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      comment: 'In days',
    },
    price: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Plan = mongoose.model<IPlanDocument>('Plan', planSchema);
