import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyAppointmentTransaction {
  @IsNotEmpty()
  @IsString()
  reference: string;
}
