import { Profile } from '../types/profile.types';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Condition } from '../entities/pre-existing-condition.entity';
import { Type } from 'class-transformer';
import { EmergencyContact } from '../entities/emergency-contact.entity';
import { Dependant } from '../entities/dependant.entity';

export class ProfileSetupDto {
  @ValidateNested({ each: true })
  @Type(() => Profile)
  readonly profile: Profile;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Condition)
  pre_existing_conditions?: Condition[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContact)
  emergency_contacts: EmergencyContact[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Dependant)
  dependants?: Dependant[];
}
