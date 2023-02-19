import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Subscription,
  SubscriptionSchema,
} from './entities/subscription.entity';
import { UsersModule } from '../users/users.module';
import { PaymentsModule } from '../payments/payments.module';
import { PlansModule } from '../plans/plans.module';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { PaymentHandler } from '../../common/external/payment/payment.handler';
import { AdminSettingsModule } from '../admin-settings/admin-settings.module';
import { Paystack } from '../../common/external/payment/providers/paystack';

@Module({
  imports: [
    UsersModule,
    PaymentsModule,
    PlansModule,
    AdminSettingsModule,
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, GeneralHelpers, PaymentHandler, Paystack],
})
export class SubscriptionsModule {}
