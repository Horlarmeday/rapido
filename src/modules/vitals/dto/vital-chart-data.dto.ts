import { IsNotEmpty } from 'class-validator';

export class VitalChartDataDto {
  @IsNotEmpty()
  readonly vitalToSelect: string;

  @IsNotEmpty()
  readonly start_date: Date;

  @IsNotEmpty()
  readonly end_date: Date;
  readonly duration?: string;
}
