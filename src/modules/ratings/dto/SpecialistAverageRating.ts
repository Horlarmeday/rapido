import { Types } from 'mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

export class SpecialistAverageRating {
  @IsNotEmpty()
  @IsString()
  readonly specialistId: Types.ObjectId;
}
