import { Types } from 'mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

export class InitializeAppointmentTransaction {
  @IsNotEmpty()
  @IsString()
  appointmentId: Types.ObjectId;
}
