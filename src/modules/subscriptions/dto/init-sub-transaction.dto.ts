import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class InitSubTransactionDto {
  @IsNotEmpty()
  @IsString()
  subscriptionId: Types.ObjectId;
}
