import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Status } from '../../payments/entities/payment.entity';

export type AppointmentDocument = HydratedDocument<Appointment>;

export enum AppointmentStatus {
  OPEN = 'OPEN',
  CLOSE = 'CLOSE',
}

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Appointment {
  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: Date, required: true })
  start_time: Date;

  @Prop({ type: String })
  timezone: string;

  @Prop({ type: String, required: true })
  appointment_type: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  patient: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  specialist: Types.ObjectId;

  @Prop({ type: String })
  join_url: string;

  @Prop({ type: String })
  start_url: string;

  @Prop({ type: String })
  meeting_id: string;

  @Prop({
    type: String,
    enum: { values: [Status.SUCCESSFUL, Status.FAILED, Status.PENDING] },
    default: Status.PENDING,
  })
  payment_status: Status;

  @Prop({
    type: String,
    enum: { values: [AppointmentStatus.OPEN, AppointmentStatus.CLOSE] },
    default: AppointmentStatus.OPEN,
  })
  status: AppointmentStatus;
}
export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
