import { Types } from 'mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

export class MakeBankDefaultDto {
  @IsNotEmpty()
  @IsString()
  readonly bankId: Types.ObjectId;
}
