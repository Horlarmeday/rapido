import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Phone } from '../../users/types/profile.types';

export type PharmacyDocument = HydratedDocument<Pharmacy>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Pharmacy {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String })
  zip_code: string;

  @Prop(
    raw({
      number: { type: String },
      country_code: { type: String },
    }),
  )
  phone: Phone;

  @Prop({ type: String })
  state: string;

  @Prop({ type: Boolean, default: false })
  is_email_verified: boolean;

  @Prop({ type: Boolean, default: false })
  is_phone_verified: boolean;

  @Prop({ type: Date })
  email_verified_at: Date;

  @Prop({ type: Date })
  phone_verified_at: Date;
}
export const PharmacySchema = SchemaFactory.createForClass(Pharmacy);
