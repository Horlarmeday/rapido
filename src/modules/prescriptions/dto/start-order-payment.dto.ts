import { IsNotEmpty, IsNumber } from 'class-validator';

export class StartOrderPaymentDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
