import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as moment from 'moment';
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
import { UsersService } from '../users/users.service';
import { PlansService } from '../plans/plans.service';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { PaymentsService } from '../payments/payments.service';
import { PaymentHandler } from '../../common/external/payment/payment.handler';
import { CardsService } from '../cards/cards.service';

@Injectable()
export class SubscriptionsService {
  private logger = new Logger(SubscriptionsService.name);
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    private readonly usersService: UsersService,
    private readonly plansService: PlansService,
    private readonly generalHelpers: GeneralHelpers,
    private readonly paymentService: PaymentsService,
    private readonly paymentHandler: PaymentHandler,
    private readonly cardsService: CardsService,
  ) {}
  async subscribeToPlan(
    createSubscriptionDto: CreateSubscriptionDto,
    userId: Types.ObjectId,
  ) {
    const { cardId, planId, recurrence } = createSubscriptionDto;
    const [user, card, plan] = await Promise.all([
      this.usersService.findById(userId),
      this.cardsService.getCard(cardId),
      this.plansService.findOnePlan(planId),
    ]);
    const amount =
      recurrence === Recurrence.ANNUALLY
        ? plan.amount * 12 // multiply amount by the next 12 months
        : plan.amount;
    const reference = this.generalHelpers.genTxReference();
    const metadata = {
      name: user.full_name,
      email: user.profile.contact.email,
      payment_for: PaymentFor.SUBSCRIPTION,
    };
    const response = await this.paymentHandler.tokenizedCharge({
      email: user.profile.contact.email,
      amount,
      reference,
      token: card.auth_code,
      currency: 'NGN',
      metadata,
    });
    if (response.status === SUCCESS) {
      await this.paymentService.create(
        userId,
        reference,
        plan.amount,
        PaymentFor.SUBSCRIPTION,
      );
      //todo: Use transactions here
      const subscription = await create(this.subscriptionModel, {
        ...createSubscriptionDto,
        userId,
      });
      await this.usersService.updateOne(userId, {
        plan: {
          plan_name: plan.name,
          planId: plan._id,
        },
      });
      return this.verifySubscription(reference, subscription._id);
    }
    throw new InternalServerErrorException();
  }

  async findOneSubscription(
    subscriptionId: Types.ObjectId,
  ): Promise<SubscriptionDocument> {
    return await findOne(
      this.subscriptionModel,
      { _id: subscriptionId },
      { populate: 'planId' },
    );
  }

  async verifySubscription(reference: string, subscriptionId: Types.ObjectId) {
    const response = await this.paymentHandler.verifyTransaction(reference);
    try {
      switch (response?.data?.status) {
        case SUCCESS:
          const subscription = await this.findOneSubscription(subscriptionId);
          await Promise.all([
            this.updateSubscription(subscriptionId, {
              status: SubscriptionStatus.ACTIVE,
              current_period_end: this.calculatePeriodEnd(
                subscription.recurrence,
                new Date(),
              ),
              amount_paid: response.data.amount / 100,
            }),
            this.paymentService.updatePayment(reference, {
              status: Status.SUCCESSFUL,
              metadata: {
                subscription_id: subscriptionId,
              },
            }),
            response.data?.authorization?.reusable
              ? this.cardsService.saveCardDetails(
                  response.data.authorization,
                  subscription.userId,
                )
              : [],
          ]);
          return this.findOneSubscription(subscriptionId);
        case FAILED:
          const subscription1 = await this.findOneSubscription(subscriptionId);
          await Promise.all([
            this.updateSubscription(subscriptionId, {
              status: SubscriptionStatus.DECLINED,
              current_period_end: this.calculatePeriodEnd(
                subscription1.recurrence,
                new Date(),
              ),
              amount_paid: response.data.amount / 100,
            }),
            this.paymentService.updatePayment(reference, {
              status: Status.FAILED,
              metadata: {
                subscription_id: subscriptionId,
              },
            }),
          ]);
          return this.findOneSubscription(subscriptionId);
        case PENDING:
          return this.findOneSubscription(subscriptionId);
        default:
          return this.findOneSubscription(subscriptionId);
      }
    } catch (e) {
      this.logger.error('An error occurred verifying subscription', e);
      throw new InternalServerErrorException(e, 'An error occurred');
    }
  }

  async updateSubscription(
    subscriptionId: Types.ObjectId,
    fieldsToUpdate: object,
  ) {
    await updateOne(
      this.subscriptionModel,
      { _id: subscriptionId },
      {
        ...fieldsToUpdate,
      },
    );
    this.logger.log(`Updated subscriptionId: ${subscriptionId}`);
  }

  calculatePeriodEnd(recurrence: Recurrence, currentDate: Date) {
    if (!recurrence) {
      return null;
    }

    if (recurrence === Recurrence.MONTHLY) {
      return moment(currentDate).add(30, 'days').toDate();
    }

    if (recurrence === Recurrence.ANNUALLY) {
      return moment(currentDate).add(12, 'months').toDate();
    }
  }

  async getUserSubscriptions(userId: Types.ObjectId) {
    return await find(
      this.subscriptionModel,
      { userId },
      { populate: 'planId' },
    );
  }

  async getActiveSubscription(userId: Types.ObjectId) {
    return await findOne(
      this.subscriptionModel,
      {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      {
        populate: 'planId',
        populateSelectFields: ['call_duration', 'name'],
      },
    );
  }
}
