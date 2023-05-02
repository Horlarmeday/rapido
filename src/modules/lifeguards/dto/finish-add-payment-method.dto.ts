import { IsNotEmpty, IsString } from 'class-validator';

export class FinishAddPaymentMethodDto {
  @IsNotEmpty()
  @IsString()
  reference: string;
}
