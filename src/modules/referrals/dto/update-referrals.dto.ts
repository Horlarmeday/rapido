import { Types } from 'mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateReferralsDto {
  @IsNotEmpty()
  @IsString()
  referee: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  referral_code: string;
}
