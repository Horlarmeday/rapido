import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsString()
  category: string;

  @IsDate()
  @IsNotEmpty()
  start_time: Date;

  @IsNotEmpty()
  @IsString()
  timezone: string;

  @IsNotEmpty()
  @IsString()
  appointment_type: string;

  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  specialist: Types.ObjectId;
}
