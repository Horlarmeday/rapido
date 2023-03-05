import { User } from '../../users/entities/user.entity';

export type ICalendarType = {
  readonly patient: User;
  readonly specialist: User;
  readonly start_time: Date;
  readonly topic: string;
  readonly call_duration?: string;
  readonly link: Record<string, string>;
};
