import { Types } from 'mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendPharmacyPrescriptionDto {
  @IsNotEmpty()
  @IsString()
  pharmacy: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  prescriptionId: Types.ObjectId;
}
