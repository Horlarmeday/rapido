import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type BankDocument = HydratedDocument<Bank>;

export enum RecipientType {
  NUBAN = 'nuban',
  MOBILE_MONEY = 'mobile_money',
}

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Bank {
  @Prop({ type: String, required: true })
  account_number: string;

  @Prop({ type: String, required: true })
  account_name: string;

  @Prop({ type: String, required: true })
  bank_name: string;

  @Prop({ type: String, required: true })
  bank_code: string;

  @Prop({ type: String })
  recipient_code: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: String, default: 'NGN' })
  currency: string;

  @Prop({
    type: String,
    enum: { values: [RecipientType.MOBILE_MONEY, RecipientType.NUBAN] },
    default: RecipientType.NUBAN,
  })
  recipient_type: RecipientType;

  @Prop({ type: Boolean, default: false })
  is_default: boolean;
}

export const BankSchema = SchemaFactory.createForClass(Bank);
