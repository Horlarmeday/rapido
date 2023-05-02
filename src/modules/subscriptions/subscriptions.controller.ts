import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { VerifySubTransactionDto } from './dto/verify-sub-transaction.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';

@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Request() req,
  ) {
    const result = await this.subscriptionsService.subscribeToPlan(
      createSubscriptionDto,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.CREATED, result);
  }

  @HttpCode(HttpStatus.OK)
  @Post('transactions/verify')
  async verifyTransaction(
    @Body() verifySubTransactionDto: VerifySubTransactionDto,
  ) {
    const { reference, subscriptionId } = verifySubTransactionDto;
    const result = await this.subscriptionsService.verifySubscription(
      reference,
      subscriptionId,
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

  @Get('active')
  async getActiveSubscription(@Request() req) {
    const result = await this.subscriptionsService.getActiveSubscription(
      req.user.sub,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Patch('cancel')
  async cancelSubscription(
    @Body() cancelSubscriptionDto: CancelSubscriptionDto,
    @Request() req,
  ) {
    const result = await this.subscriptionsService.cancelSubscription(
      cancelSubscriptionDto.subscriptionId,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.UPDATED, result);
  }
}
