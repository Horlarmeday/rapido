import {
  Documents,
  PaymentStructure,
  ProfessionalPractice,
  Profile,
} from '../types/profile.types';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';

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

  @IsNotEmpty()
  @IsEnum(PaymentStructure)
  payment_structure: PaymentStructure;
}
