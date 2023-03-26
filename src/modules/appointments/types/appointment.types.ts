import { User } from '../../users/entities/user.entity';
import { Types } from 'mongoose';

export type ICalendarType = {
  readonly patient: User;
  readonly specialist: User;
  readonly start_time: Date;
  readonly topic: string;
  readonly call_duration?: string;
  readonly link: Record<string, string>;
  readonly appointmentId: Types.ObjectId;
};
