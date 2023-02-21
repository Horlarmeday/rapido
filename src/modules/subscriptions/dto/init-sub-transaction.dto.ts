import { IsNotEmpty, IsString } from 'class-validator';

export class InitSubTransactionDto {
  @IsNotEmpty()
  @IsString()
  subscriptionId: string;
}
