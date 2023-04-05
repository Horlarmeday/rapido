import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Age } from '../types/health-checkup.types';
import { Type } from 'class-transformer';

export class ExplainConditionDto {
  @IsOptional()
  sex: string;

  @Type(() => Age)
  age: Age;

  @IsNotEmpty()
  @IsString()
  target: string;

  @IsArray()
  evidence: any[];
}
