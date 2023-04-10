import { Types } from 'mongoose';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class WithdrawFundDto {
  @IsNotEmpty()
  @IsString()
  bankId: Types.ObjectId;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
