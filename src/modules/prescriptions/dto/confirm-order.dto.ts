import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class ConfirmOrderDto {
  @IsNotEmpty()
  @IsString()
  orderId: Types.ObjectId;
}
