import { IsNotEmpty, IsOptional } from 'class-validator';

export class VitalChartDataDto {
  @IsNotEmpty()
  readonly vitalToSelect: string;

  @IsOptional()
  readonly start_date: Date;

  @IsOptional()
  readonly end_date: Date;
  readonly duration?: string;
}
