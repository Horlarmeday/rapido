import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Dosage } from '../../prescriptions/types/prescription.types';

export enum Frequency {
  ONCE = 'Once',
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
}

export enum Interval {
  DAYS = 'Days',
  WEEKS = 'Weeks',
  MONTHS = 'Months',
}

export enum ReminderStatus {
  SCHEDULED = 'Scheduled',
  PENDING = 'Pending',
  COMPLETE = 'Complete',
}

export enum ReminderType {
  PRESCRIPTION = 'Prescription',
  OTHER = 'Other',
}

export type ReminderDocument = HydratedDocument<Reminder>;
@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { getters: true, virtuals: true },
})
export class Reminder {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  data: any;

  @Prop({
    type: Date,
    required: true,
    get: (v) => moment(v).format('YYYY-MM-DD'),
  })
  start_date: Date;

  @Prop({
    type: Date,
    required: true,
    get: (v) => moment(v).format('hh:mm:ss a'),
  })
  start_time: Date;

  @Prop({
    type: String,
    enum: {
      values: [
        Frequency.DAILY,
        Frequency.MONTHLY,
        Frequency.WEEKLY,
        Frequency.ONCE,
      ],
    },
  })
  frequency: Frequency;

  @Prop({ type: Number })
  period: number;

  @Prop({
    type: String,
    enum: { values: [Interval.DAYS, Interval.MONTHS, Interval.WEEKS] },
    default: Interval.DAYS,
  })
  interval: Interval;

  @Prop({ type: Boolean, default: false })
  is_all_day: boolean;

  @Prop({
    type: String,
    enum: {
      values: [
        ReminderStatus.COMPLETE,
        ReminderStatus.SCHEDULED,
        ReminderStatus.PENDING,
      ],
    },
    default: ReminderStatus.PENDING,
  })
  status: ReminderStatus;

  @Prop({
    type: String,
    enum: {
      values: [ReminderType.OTHER, ReminderType.PRESCRIPTION],
    },
    default: ReminderType.OTHER,
  })
  type: ReminderType;

  @Prop(
    raw({
      dose: {
        quantity: { type: Number },
        dosage_form: { type: String },
      },
      interval: {
        time: { type: String },
        unit: { type: String },
      },
      period: {
        number: { type: Number },
        unit: { type: String },
      },
    }),
  )
  dosage: Dosage;
}
export const ReminderSchema = SchemaFactory.createForClass(Reminder);
