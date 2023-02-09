import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class EmailVerificationTokenDto {
  @IsNotEmpty()
  @IsString()
  readonly userId: Types.ObjectId;
}
