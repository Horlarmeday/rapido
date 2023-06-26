import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Documents } from '../../users/types/profile.types';

export class UploadPrescriptionDto {
  @IsNotEmpty()
  @IsString()
  specialist: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Documents)
  documents?: Documents[];
}
