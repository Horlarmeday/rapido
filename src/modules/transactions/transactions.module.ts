import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PaymentsModule } from '../payments/payments.module';
import { PaymentHandler } from '../../common/external/payment/payment.handler';
import { Paystack } from '../../common/external/payment/providers/paystack';
import { AdminSettingsModule } from '../admin-settings/admin-settings.module';

@Module({
  imports: [PaymentsModule, AdminSettingsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, PaymentHandler, Paystack],
})
export class TransactionsModule {}
