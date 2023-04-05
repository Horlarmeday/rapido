import { IsNotEmpty, IsNumber } from 'class-validator';

export class RiskFactorsDto {
  @IsNotEmpty()
  @IsNumber()
  age: number;
}
