import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Award } from '../types/profile.types';

export class CreateAwardDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Award)
  awards?: Award[];
}
