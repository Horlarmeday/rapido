import { IsNotEmpty, IsOptional } from 'class-validator';

export class WalletTxnQueryDto {
  @IsNotEmpty()
  currentPage: number;

  @IsOptional()
  pageLimit: number;

  @IsOptional()
  type: string;
}
