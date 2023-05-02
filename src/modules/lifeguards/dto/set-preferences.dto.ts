import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class SetPreferencesDto {
  @IsNotEmpty()
  @IsString()
  age_range: string;

  @IsNotEmpty()
  @IsString()
  gender: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  treatment_class: string;

  @IsNotEmpty()
  @IsString()
  donation_type: string;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsNumber()
  amount_donated: number;

  @IsNotEmpty()
  @IsString()
  cardId: Types.ObjectId;
}
