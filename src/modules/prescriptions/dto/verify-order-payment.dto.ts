import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class VerifyOrderPaymentDto {
  @IsNotEmpty()
  @IsString()
  reference: string;

  @IsNotEmpty()
  @IsString()
  orderId: Types.ObjectId;
}
