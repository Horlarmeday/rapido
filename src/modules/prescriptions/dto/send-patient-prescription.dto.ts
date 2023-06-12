import { Types } from 'mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendPatientPrescriptionDto {
  @IsNotEmpty()
  @IsString()
  prescriptionId: Types.ObjectId;
}
