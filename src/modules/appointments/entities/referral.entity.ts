import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ReferralType } from '../types/referral-types';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type AppointmentReferralDocument = HydratedDocument<AppointmentReferral>;

@Schema({ collection: 'appointment_referrals' })
export class AppointmentReferral {
  @Prop(
    raw([
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        most_recommended: { type: Boolean, default: false },
      },
    ]),
  )
  specialists: ReferralType[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  patient: Types.ObjectId;

  @Prop({
    required: true,
    type: String,
  })
  referral_note?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  referred_by: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  })
  appointment: Types.ObjectId;
}
export const AppointmentReferralSchema =
  SchemaFactory.createForClass(AppointmentReferral);
