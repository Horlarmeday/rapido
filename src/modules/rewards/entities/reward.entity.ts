import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export enum RewardActivity {
  SIGN_UP = 'Sign up',
  COMPLETED_PROFILE = 'Completed Profile',
  COMPLETED_APPOINTMENT = 'Completed appointment',
  REFERRAL = 'Referral',
  NEWSLETTER_SUBSCRIPTION = 'Newsletter Subscription',
}

export type RewardDocument = HydratedDocument<Reward>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Reward {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    enum: {
      values: [
        RewardActivity.COMPLETED_APPOINTMENT,
        RewardActivity.COMPLETED_PROFILE,
        RewardActivity.NEWSLETTER_SUBSCRIPTION,
        RewardActivity.REFERRAL,
        RewardActivity.SIGN_UP,
      ],
    },
  })
  activity: RewardActivity;

  @Prop({ type: Number, default: 0 })
  points: number;

  @Prop({ type: Number, default: 0 })
  free_checkups: number;

  @Prop({ type: Number, default: 0 })
  dependant_free_checkups: number;

  @Prop({ type: Number, default: 0 })
  cashback: number;

  @Prop({ type: Date })
  expiry_date: number;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
