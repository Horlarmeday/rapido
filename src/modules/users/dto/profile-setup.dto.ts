import { Gender, MaritalStatus } from '../types/profile.types';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
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
  @IsNumber({}, { each: true })
  basic_health_info: Map<number, number>;
  //
  // @IsNotEmpty()
  // @IsNumber()
  // height: number;
  //
  // @IsNotEmpty()
  // @IsNumber()
  // weight: number;

  @IsBoolean({
    each: true,
  })
  health_risk_factors: Map<boolean, boolean>;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Dependant)
  dependants: Dependant[];
}
