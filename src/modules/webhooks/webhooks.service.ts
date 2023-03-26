import {
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Webhook, WebhookDocument } from './entities/webhook.entity';
import { create, deleteOne } from 'src/common/crud/crud';
import { TaskScheduler } from '../../core/worker/task.scheduler';
import { PaystackWebhookData, WebhookEventTypes } from './types/webhook.types';
import { Status } from '../payments/entities/payment.entity';
import { PaymentsService } from '../payments/payments.service';
import { CardsService } from '../cards/cards.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebhookEvents } from './events/webhook.events';
import { Subject } from 'rxjs';

@Injectable()
export class WebhooksService {
  private logger: LoggerService = new Logger(WebhooksService.name);
  private events = new Subject();
  constructor(
    @InjectModel(Webhook.name) private webhookModel: Model<WebhookDocument>,
    private readonly taskCron: TaskScheduler,
    private readonly paymentService: PaymentsService,
    private readonly cardService: CardsService,
    private eventEmitter: EventEmitter2,
  ) {}
  async createWebhook(body: PaystackWebhookData) {
    this.logger.log(`Received webhook ${body.event} from Paystack`);
    const webhook = await create(this.webhookModel, {
      event: body?.event,
      data: body?.data,
    });
    this.addEvent(
      new WebhookEvents({
        event: webhook.event,
        data: webhook.data,
      }),
    );
    this.logger.log(`Create webhook ${webhook._id} in the database`);
    await this.taskCron.addCron(
      this.processWebhook(webhook),
      `${Date.now()}-processWebhook-${body.event}`,
      [10, 'seconds'],
    );
    return true;
  }

  async processWebhook(webhook: WebhookDocument) {
    switch (webhook.event) {
      case WebhookEventTypes.TRANSACTION_SUCCESS:
        await this.handleTransactionSuccess(webhook);
        break;
      case WebhookEventTypes.TRANSFER_SUCCESS:
        //do nothing for now
        break;
    }
  }

  async handleTransactionSuccess(webhook: WebhookDocument) {
    const payment = await this.paymentService.findPaymentByReference(
      webhook.data.reference,
    );
    try {
      await Promise.all([
        this.paymentService.updatePayment(webhook.data.reference, {
          status: Status.SUCCESSFUL,
          metadata: {
            ...webhook.data.metadata,
          },
          currency: webhook.data.currency,
        }),
        webhook.data?.authorization?.reusable
          ? this.cardService.saveCardDetails(
              webhook.data.authorization,
              payment.userId,
            )
          : [],
        this.deleteWebhook(webhook._id),
      ]);
      this.logger.log('Updated payment and transaction successfully');
    } catch (e) {
      this.logger.error(e?.message, e);
      throw new InternalServerErrorException(e);
    }
  }

  async deleteWebhook(webhookId) {
    await deleteOne(this.webhookModel, { _id: webhookId });
    this.logger.log(`Deleted webhook ${webhookId}`);
  }

  addEvent(event: WebhookEvents) {
    this.events.next(event);
  }

  sendEvent() {
    return this.events.asObservable();
  }
}
