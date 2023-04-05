import { IsArray, IsBoolean, IsOptional } from 'class-validator';
import { Age } from '../types/health-checkup.types';
import { Type } from 'class-transformer';

export class CheckDiagnosisDto {
  @IsOptional()
  sex: string;

  @Type(() => Age)
  age: Age;

  @IsArray()
  evidence: any[];

  @IsBoolean()
  should_stop: boolean;
}
