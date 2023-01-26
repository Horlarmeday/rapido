import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type AppointmentDocument = HydratedDocument<Appointment>;

@Schema()
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
  patient: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  specialist: string;

  @Prop({ type: String, required: true })
  join_url: string;

  @Prop({ type: String, required: true })
  start_url: string;

  @Prop({ type: String })
  zoom_meeting_id: string;
}
export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
