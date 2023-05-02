import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Status } from '../../payments/entities/payment.entity';

export type PaymentLogDocument = HydratedDocument<PaymentLog>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'lifeguard_payment_logs',
})
export class PaymentLog {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lifeguard',
    required: true,
  })
  lifeguardId: string;

  @Prop({ type: Number })
  amount: number;

  @Prop({ type: String })
  currency: string;

  @Prop({ type: String, required: true, unique: true })
  reference: string;

  @Prop({
    type: String,
    enum: { values: [Status.FAILED, Status.SUCCESSFUL, Status.PENDING] },
    default: Status.PENDING,
  })
  status: Status;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  metadata: any;
}
export const PaymentLogSchema = SchemaFactory.createForClass(PaymentLog);
