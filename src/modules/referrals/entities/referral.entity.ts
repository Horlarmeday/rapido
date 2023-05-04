import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/entities/user.entity';

export type ReferralDocument = HydratedDocument<Referral>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Referral {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  referrer: User;

  @Prop(
    raw([
      {
        referee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        date_referred: { type: Date, default: new Date() },
        _id: false,
      },
    ]),
  )
  referrals: any;

  @Prop({ type: String, required: true })
  referral_code: string;
}
export const ReferralSchema = SchemaFactory.createForClass(Referral);
