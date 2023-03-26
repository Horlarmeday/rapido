import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CancelAppointmentDto {
  @IsNotEmpty()
  @IsString()
  appointmentId: Types.ObjectId;
}
