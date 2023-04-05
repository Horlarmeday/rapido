import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Age } from '../types/health-checkup.types';

export class ParseTextDto {
  @IsOptional()
  sex: string;

  @Type(() => Age)
  age: Age;
  @IsString()
  text: string;
}
