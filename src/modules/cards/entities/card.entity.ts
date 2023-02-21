import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type CardDocument = HydratedDocument<Card>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Card {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  currency: string;

  @Prop({ type: String, required: true })
  auth_code: string;

  @Prop({ type: String, required: true })
  last4Digit: string;

  @Prop({ type: Date, required: true })
  expiry: Date;

  @Prop({ type: String, required: true })
  issuer: string;

  @Prop({ type: String, required: true })
  card_type: string;

  @Prop({ type: String })
  agent: string;

  @Prop({ type: Boolean, default: false })
  default: boolean;
}
export const CardSchema = SchemaFactory.createForClass(Card);
