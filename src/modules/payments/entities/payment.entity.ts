import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

export enum Status {
  SUCCESSFUL = 'SUCCESSFUL',
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
    enum: { values: [Status.FAILED, Status.SUCCESSFUL, Status.PENDING] },
    default: Status.PENDING,
  })
  status: Status;

  @Prop({
    type: String,
    enum: {
      values: [
        PaymentFor.TEST,
        PaymentFor.APPOINTMENT,
        PaymentFor.SUBSCRIPTION,
      ],
    },
  })
  payment_for: PaymentFor;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  metadata: any;
}
export const PaymentSchema = SchemaFactory.createForClass(Payment);
