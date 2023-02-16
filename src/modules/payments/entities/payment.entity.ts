import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

export enum Status {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}

export enum PaymentFor {
  APPOINTMENT = 'Appointment',
  SUBSCRIPTION = 'Subscription',
  TEST = 'Test',
}

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Payment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: String, required: true })
  amount: string;

  @Prop({ type: String, required: true, unique: true })
  reference: string;

  @Prop({
    type: String,
    enum: { values: [Status.FAILED, Status.SUCCESS, Status.PENDING] },
    default: Status.PENDING,
  })
  status: Status;

  @Prop({ type: String })
  payment_for: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  meta: any;
}
export const PaymentSchema = SchemaFactory.createForClass(Payment);
