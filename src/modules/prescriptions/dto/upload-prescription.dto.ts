import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Documents } from '../../users/types/profile.types';
import { Types } from 'mongoose';

export class UploadPrescriptionDto {
  @IsNotEmpty()
  @IsString()
  specialist: Types.ObjectId;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Documents)
  documents?: Documents[];
}
