import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { Recurrence } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  plan_id: Types.ObjectId;

  @IsNotEmpty()
  @IsEnum(Recurrence)
  recurrence: Recurrence;
}
