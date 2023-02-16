import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyTransactionDto {
  @IsNotEmpty()
  @IsString()
  reference: string;
}
