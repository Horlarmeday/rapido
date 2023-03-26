import { IsObject, IsNotEmptyObject, ValidateNested } from 'class-validator';
import { Preferences } from '../types/preference.types';
import { Type } from 'class-transformer';

export class SpecialistPreferencesDto {
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested({ each: true })
  @Type(() => Preferences)
  preferences: Preferences;
}
