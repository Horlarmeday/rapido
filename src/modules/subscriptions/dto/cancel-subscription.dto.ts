import { Types } from 'mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

export class CancelSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  subscriptionId: Types.ObjectId;
}
