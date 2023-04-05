import { IsArray, IsOptional } from 'class-validator';
import { Age } from '../types/health-checkup.types';
import { Type } from 'class-transformer';

export class SuggestedSymptomsDto {
  @IsOptional()
  sex: string;

  @Type(() => Age)
  age: Age;

  @IsArray()
  evidence: any[];
}
