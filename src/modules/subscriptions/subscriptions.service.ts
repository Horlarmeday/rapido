import { Injectable } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Recurrence,
  Subscription,
  SubscriptionDocument,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { Model, Types } from 'mongoose';
import { create, find, findOne, updateOne } from 'src/common/crud/crud';
import { PaymentFor, Status } from '../payments/entities/payment.entity';
import { FAILED, PENDING, SUCCESS } from '../../core/constants';
import { InitSubTransactionDto } from './dto/init-sub-transaction.dto';
import { UsersService } from '../users/users.service';
import { PlansService } from '../plans/plans.service';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { PaymentsService } from '../payments/payments.service';
import { PaymentHandler } from '../../common/external/payment/payment.handler';
import moment from 'moment';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    private readonly usersService: UsersService,
    private readonly plansService: PlansService,
    private readonly generalHelpers: GeneralHelpers,
    private readonly paymentService: PaymentsService,
    private readonly paymentHandler: PaymentHandler,
  ) {}
  async createSubscription(
    createSubscriptionDto: CreateSubscriptionDto,
    userId: Types.ObjectId,
  ) {
    return await create(this.subscriptionModel, {
      ...createSubscriptionDto,
      userId,
    });
  }

  async findOneSubscription(
    subscriptionId: string,
  ): Promise<SubscriptionDocument> {
    return await findOne(this.subscriptionModel, { _id: subscriptionId });
  }

  async initializeTransaction(
    userId: Types.ObjectId,
    initSubTz: InitSubTransactionDto,
  ) {
    const [user, subscription] = await Promise.all([
      this.usersService.findById(userId),
      this.findOneSubscription(initSubTz.subscriptionId),
    ]);
    const reference = this.generalHelpers.genTxReference();
    const plan = await this.plansService.findOnePlan(subscription.plan_id);
    const amount =
      subscription.recurrence === Recurrence.ANNUALLY
        ? plan.amount * 12 // multiply amount by the next 12 months
        : plan.amount;
    const metadata = {
      name: user.full_name,
      email: user.profile.contact.email,
      subscription_id: initSubTz.subscriptionId,
      payment_for: PaymentFor.SUBSCRIPTION,
    };
    const response = await this.paymentHandler.initializeTransaction(
      user.profile.contact.email,
      amount,
      reference,
      metadata,
    );
    if (response.status === SUCCESS) {
      await this.paymentService.create(
        userId,
        reference,
        plan.amount,
        PaymentFor.SUBSCRIPTION,
      );
    }
    return response.data;
  }

  async verifySubscription(reference: string) {
    const response = await this.paymentHandler.verifyTransaction(reference);
    switch (response?.data?.status) {
      case SUCCESS:
        const subscriptionId = response.data.metadata.subscription_id;
        const subscription = await this.findOneSubscription(subscriptionId);
        await Promise.all([
          this.updateSubscription(subscriptionId, {
            status: SubscriptionStatus.ACTIVE,
            current_period_end: this.calculatePeriodEnd(
              subscription.recurrence,
              new Date(),
            ),
            amount_paid: response.data.amount,
          }),
          this.paymentService.updatePayment(reference, {
            status: Status.SUCCESSFUL,
            metadata: {
              subscription_id: subscriptionId,
            },
          }),
        ]);
        return this.findOneSubscription(subscriptionId);
      case FAILED:
        const subscriptionId1 = response.data.metadata.subscription_id;
        const subscription1 = await this.findOneSubscription(subscriptionId1);
        await Promise.all([
          this.updateSubscription(subscriptionId1, {
            status: SubscriptionStatus.DECLINED,
            current_period_end: this.calculatePeriodEnd(
              subscription1.recurrence,
              new Date(),
            ),
            amount_paid: response.data.amount,
          }),
          this.paymentService.updatePayment(reference, {
            status: Status.FAILED,
            metadata: {
              subscription_id: subscriptionId1,
            },
          }),
        ]);
        return this.findOneSubscription(subscriptionId1);
      case PENDING:
        const subscriptionId2 = response.data.metadata.subscription_id;
        return this.findOneSubscription(subscriptionId2);
      default:
        const subscriptionId3 = response.data.metadata.subscription_id;
        return this.findOneSubscription(subscriptionId3);
    }
  }

  async updateSubscription(subscriptionId: string, fieldsToUpdate: object) {
    await updateOne(
      this.subscriptionModel,
      { _id: subscriptionId },
      {
        ...fieldsToUpdate,
      },
    );
  }

  calculatePeriodEnd(recurrence: Recurrence, currentDate: Date) {
    let subscriptionPeriodEnd;
    if (!recurrence) {
      return null;
    }

    if (recurrence === Recurrence.MONTHLY) {
      subscriptionPeriodEnd = moment(currentDate).add(30, 'days').toDate();
      return subscriptionPeriodEnd;
    }

    if (recurrence === Recurrence.ANNUALLY) {
      subscriptionPeriodEnd = moment(currentDate).add(12, 'months').toDate();
      return subscriptionPeriodEnd;
    }
  }

  async getUserSubscriptions(userId: Types.ObjectId) {
    return await find(this.subscriptionModel, { userId });
  }
}
