import { Types } from 'mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteBankDto {
  @IsNotEmpty()
  @IsString()
  readonly bankId: Types.ObjectId;
}
