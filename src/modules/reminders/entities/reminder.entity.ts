import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum Frequency {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
}

export enum Interval {
  DAYS = 'Days',
  WEEKS = 'Weeks',
  MONTHS = 'Months',
}

export type ReminderDocument = HydratedDocument<Reminder>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Reminder {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  data: any;

  @Prop({ type: String, required: true })
  start_date: Date;

  @Prop({ type: String, required: true })
  start_time: Date;

  @Prop({
    type: String,
    enum: { values: [Frequency.DAILY, Frequency.MONTHLY, Frequency.WEEKLY] },
  })
  frequency: Frequency;

  @Prop({ type: Number })
  period: number;

  @Prop({
    type: String,
    enum: { values: [Interval.DAYS, Interval.MONTHS, Interval.WEEKS] },
  })
  interval: Interval;

  @Prop({ type: Boolean, default: false })
  is_all_day: boolean;
}
export const ReminderSchema = SchemaFactory.createForClass(Reminder);
