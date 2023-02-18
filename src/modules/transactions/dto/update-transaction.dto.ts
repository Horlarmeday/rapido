import { PartialType } from '@nestjs/mapped-types';
import { VerifyTransactionDto } from './verify-transaction.dto';

export class UpdateTransactionDto extends PartialType(VerifyTransactionDto) {}
