import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Status } from '../../payments/entities/payment.entity';

export type AppointmentDocument = HydratedDocument<Appointment>;

export enum MeetingType {
  AUDIO = 'Audio only',
  VIDEO_AUDIO = 'Video and audio',
}

export enum AppointmentStatus {
  COMPLETED = 'COMPLETED',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  ONGOING = 'ONGOING',
  RESCHEDULED = 'RESCHEDULED',
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

  @Prop(
    raw({
      time_taken: { type: Number, default: 0 },
      unit: { type: String, default: 'Minutes' },
      formatted_string: { type: String },
    }),
  )
  call_duration: any;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  patient: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Referral' })
  referral: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  specialist: Types.ObjectId;

  @Prop({ type: String })
  join_url: string;

  @Prop({ type: String })
  start_url: string;

  @Prop({ type: String })
  meeting_id: string;

  @Prop({ type: String })
  meeting_class: string;

  @Prop({ type: Number })
  appointment_fee: number;

  @Prop({
    type: String,
    enum: { values: [Status.SUCCESSFUL, Status.FAILED, Status.PENDING] },
    default: Status.PENDING,
  })
  payment_status: Status;

  @Prop({
    type: String,
    enum: {
      values: [
        AppointmentStatus.CLOSED,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.FAILED,
        AppointmentStatus.OPEN,
        AppointmentStatus.ONGOING,
        AppointmentStatus.RESCHEDULED,
      ],
    },
    default: AppointmentStatus.OPEN,
  })
  status: AppointmentStatus;

  @Prop({
    type: String,
    enum: {
      values: [MeetingType.AUDIO, MeetingType.VIDEO_AUDIO],
    },
    default: MeetingType.VIDEO_AUDIO,
  })
  meeting_type: MeetingType;

  @Prop(
    raw([
      {
        content: { type: String },
        createdAt: { type: Date, default: new Date() },
      },
    ]),
  )
  notes: string[];
}
const AppointmentSchema = SchemaFactory.createForClass(Appointment);
AppointmentSchema.pre('find', function (next) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (this?.options._recursed) {
    return next();
  }
  this.populate({
    path: 'specialist patient',
    options: { _recursed: true },
    select: '-profile.password -profile.twoFA_secret -security',
  });
  next();
});

export { AppointmentSchema };
