import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { InitSubTransactionDto } from './dto/init-sub-transaction.dto';
import { VerifySubTransactionDto } from './dto/verify-sub-transaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Request() req,
  ) {
    const result = await this.subscriptionsService.createSubscription(
      createSubscriptionDto,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.CREATED, result);
  }

  @HttpCode(HttpStatus.OK)
  @Post('transactions/initialize')
  async initializeTransaction(
    @Request() req,
    @Body() initSubscriptionTransaction: InitSubTransactionDto,
  ) {
    const result = await this.subscriptionsService.initializeTransaction(
      req.user.sub,
      initSubscriptionTransaction,
    );
    return sendSuccessResponse(Messages.TRANSACTION_INITIALIZED, result);
  }

  @HttpCode(HttpStatus.OK)
  @Post('transactions/verify')
  async verifyTransaction(
    @Body() verifySubTransactionDto: VerifySubTransactionDto,
  ) {
    const result = await this.subscriptionsService.verifySubscription(
      verifySubTransactionDto.reference,
    );
    return sendSuccessResponse(Messages.TRANSACTION_VERIFIED, result);
  }

  @Get()
  async getUserSubscriptions(@Request() req) {
    const result = await this.subscriptionsService.getUserSubscriptions(
      req.user.sub,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }
}
