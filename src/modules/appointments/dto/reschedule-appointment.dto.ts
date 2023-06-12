import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class RescheduleAppointmentDto {
  @IsNotEmpty()
  @IsString()
  appointmentId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  date: Date;

  @IsNotEmpty()
  @IsString()
  time: string;
}
