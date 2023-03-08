import { IsOptional } from 'class-validator';

export class QueryVitalDto {
  @IsOptional()
  readonly fieldsToSelect: string | string[];
}
