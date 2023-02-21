import { IsNotEmpty, IsString } from 'class-validator';

export class VerifySubTransactionDto {
  @IsNotEmpty()
  @IsString()
  reference: string;
}
