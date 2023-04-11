import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class VerifySubTransactionDto {
  @IsNotEmpty()
  @IsString()
  reference: string;

  @IsNotEmpty()
  @IsString()
  subscriptionId: Types.ObjectId;
}
