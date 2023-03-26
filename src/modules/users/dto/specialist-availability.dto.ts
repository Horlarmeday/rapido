import { IsArray, ValidateNested } from 'class-validator';
import { TimeAvailability } from '../types/preference.types';
import { Type } from 'class-transformer';

export class SpecialistAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeAvailability)
  time_availability: TimeAvailability[];
}
