import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Documents } from '../types/profile.types';

export class CreateCertificationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Documents)
  documents?: Documents[];
}
