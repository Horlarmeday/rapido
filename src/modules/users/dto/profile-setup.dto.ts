import {
  BasicHealthInfo,
  Gender,
  HealthRiskFactors,
  MaritalStatus,
} from '../types/profile.types';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Condition } from '../entities/pre-existing-condition.entity';
import { Type } from 'class-transformer';
import { EmergencyContact } from '../entities/emergency-contact.entity';
import { Dependant } from '../entities/dependant.entity';

export class ProfileSetupDto {
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @IsEnum(MaritalStatus)
  marital_status: MaritalStatus;

  @IsNotEmpty({
    each: true,
  })
  @ValidateNested({ each: true })
  @Type(() => BasicHealthInfo)
  basic_health_info: BasicHealthInfo;

  @ValidateNested({ each: true })
  @Type(() => HealthRiskFactors)
  health_risk_factors: HealthRiskFactors;

  @IsString()
  @IsNotEmpty()
  address1: string;

  @IsOptional()
  address2: string;
  @IsString()
  @IsNotEmpty()
  state: string;
  @IsString()
  @IsNotEmpty()
  country: string;
  @IsString()
  @IsNotEmpty()
  zip_code: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Condition)
  pre_existing_conditions: Condition[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContact)
  emergency_contacts: EmergencyContact[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Dependant)
  dependants?: Dependant[];
}
