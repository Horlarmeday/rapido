import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { Recurrence } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  planId: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  cardId: Types.ObjectId;

  @IsNotEmpty()
  @IsEnum(Recurrence)
  recurrence: Recurrence;
}
