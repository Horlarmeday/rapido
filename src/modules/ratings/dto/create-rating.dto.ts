import { Types } from 'mongoose';
import { IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsNotEmpty()
  @Max(5)
  @Min(1)
  readonly rating: number;

  @IsOptional()
  readonly message: string;

  @IsNotEmpty()
  @IsString()
  readonly specialist: Types.ObjectId;
}
