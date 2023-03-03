import {
  Documents,
  ProfessionalPractice,
  Profile,
} from '../types/profile.types';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

export class ProfessionalPracticeSetupDto {
  @ValidateNested({ each: true })
  @Type(() => Profile)
  readonly profile: Profile;

  @ValidateNested({ each: true })
  @Type(() => ProfessionalPractice)
  professional_practice: ProfessionalPractice;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Documents)
  documents: Documents[];
}
