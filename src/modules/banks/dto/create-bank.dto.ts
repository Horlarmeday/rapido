import { IsNotEmpty, IsString } from 'class-validator';
import { RecipientType } from '../entities/bank.entity';

export class CreateBankDto {
  @IsNotEmpty()
  @IsString()
  readonly account_number: string;
  @IsNotEmpty()
  @IsString()
  readonly account_name: string;
  @IsNotEmpty()
  @IsString()
  readonly bank_name: string;
  @IsNotEmpty()
  @IsString()
  readonly bank_code: string;

  @IsNotEmpty()
  @IsString()
  readonly recipient_type: RecipientType;
}
