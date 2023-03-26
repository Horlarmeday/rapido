import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Status } from '../../payments/entities/payment.entity';

export type AppointmentDocument = HydratedDocument<Appointment>;

export enum AppointmentStatus {
  COMPLETED = 'COMPLETED',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  'FAILED' = 'FAILED',
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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  patient: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
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
    enum: {
      values: [
        AppointmentStatus.CLOSED,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.FAILED,
        AppointmentStatus.OPEN,
      ],
    },
    default: AppointmentStatus.OPEN,
  })
  status: AppointmentStatus;

  // static async paginate(param: {
  //   paginate: number;
  //   populate?: string | string[];
  //   page: number;
  //   populateSelectFields?: string | string[];
  //   order?: number;
  //   query?: any;
  //   selectFields?: string | string[];
  // }) {
  //   const generalHelpers = new GeneralHelpers();
  //   const { limit, offset } = generalHelpers.calcLimitAndOffset(
  //     param.page,
  //     param.paginate,
  //   );
  //   const options = Object.assign({ limit, offset }, param);
  //   const data = await findAndCountAll(options);
  //   return paginate(data, param.page, limit);
  // }
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
    select: 'profile.first_name profile.last_name',
  });
  next();
});

export { AppointmentSchema };
