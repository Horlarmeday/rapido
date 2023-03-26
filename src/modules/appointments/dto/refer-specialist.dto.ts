import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { ReferralType } from '../types/referral-types';
import { Type } from 'class-transformer';

export class ReferSpecialistDto {
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReferralType)
  specialists: ReferralType[];

  @IsNotEmpty()
  @IsString()
  referral_note: string;

  @IsNotEmpty()
  @IsString()
  patient: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  appointment: Types.ObjectId;
}
