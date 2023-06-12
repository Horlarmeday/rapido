import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsString()
  category: string;

  @IsString()
  @IsNotEmpty()
  date: Date;

  @IsNotEmpty()
  @IsString()
  time: string;

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
