import { Frequency, Interval } from '../entities/reminder.entity';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsEnum(Frequency)
  frequency: Frequency;

  @ValidateIf((o) => o.interval !== null)
  @IsEnum(Interval)
  interval: Interval;

  @IsOptional()
  period: number;

  @IsOptional()
  is_all_day: boolean;

  @IsOptional()
  data: any;
}
