import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Webhook, WebhookSchema } from './entities/webhook.entity';
import { PaymentsModule } from '../payments/payments.module';
import { CardsModule } from '../cards/cards.module';
import { TaskScheduler } from '../../core/worker/task.scheduler';
import { SchedulerRegistry } from '@nestjs/schedule';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Webhook.name, schema: WebhookSchema }]),
    PaymentsModule,
    CardsModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, TaskScheduler, SchedulerRegistry],
})
export class WebhooksModule {}
