import { Types } from 'mongoose';
import { RewardActivity } from '../entities/reward.entity';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRewardDto {
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsEnum(RewardActivity)
  @IsNotEmpty()
  activity: RewardActivity;

  @IsOptional()
  points?: number;

  @IsOptional()
  free_checkups?: number;

  @IsOptional()
  dependant_free_checkups?: number;

  @IsOptional()
  cashback?: number;

  @IsNotEmpty()
  expiry_date: Date;
}
