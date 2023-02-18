import { Controller, Post, Body } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { VerifyTransactionDto } from './dto/verify-transaction.dto';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('verify')
  async verifyTransaction(@Body() verifyTransactionDto: VerifyTransactionDto) {
    const result = await this.transactionsService.verifyTransaction(
      verifyTransactionDto.reference,
    );
    return sendSuccessResponse(Messages.TRANSACTION_VERIFIED, result);
  }
}
