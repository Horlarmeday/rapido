import { Types } from 'mongoose';
import { Dose, Interval, Period, Refill } from '../types/prescription.types';
import {
  IsBoolean,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePrescriptionDto {
  @IsNotEmpty()
  @IsString()
  drug_name: string;

  @IsNotEmpty()
  @IsUUID()
  patient: Types.ObjectId;

  @ValidateNested({ each: true })
  @Type(() => Dose)
  @IsNotEmptyObject()
  dose: Dose;

  @ValidateNested({ each: true })
  @Type(() => Interval)
  @IsNotEmptyObject()
  interval: Interval;

  @ValidateNested({ each: true })
  @Type(() => Period)
  @IsNotEmptyObject()
  period: Period;

  @IsBoolean()
  @IsNotEmpty()
  require_refill: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Refill)
  refill_info: Refill;
}
