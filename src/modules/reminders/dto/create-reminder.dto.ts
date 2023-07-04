import { Frequency, Interval, ReminderType } from '../entities/reminder.entity';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Dosage } from '../../prescriptions/types/prescription.types';

export class CreateReminderDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @Type(() => Date)
  start_date: Date;

  @IsNotEmpty()
  @Type(() => Date)
  start_time: Date;

  @IsString()
  @IsNotEmpty()
  frequency: Frequency;

  @IsOptional()
  type: ReminderType;

  @ValidateIf((o) => o.interval !== null)
  @IsEnum(Interval)
  interval: Interval;

  @ValidateIf((o) => o.dosage !== null)
  @Type(() => Dosage)
  dosage: Dosage;

  @IsOptional()
  period: number;

  @IsOptional()
  is_all_day: boolean;

  @IsOptional()
  data: any;
}
