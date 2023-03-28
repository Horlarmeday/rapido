import { IsNotEmpty, IsString } from 'class-validator';

export class ResolveAccountDto {
  @IsNotEmpty()
  @IsString()
  readonly account_number: string;

  @IsNotEmpty()
  @IsString()
  readonly bank_code: string;
}
