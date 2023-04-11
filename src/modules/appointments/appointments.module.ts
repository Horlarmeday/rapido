import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './entities/appointment.entity';
import { Zoom } from '../../common/external/zoom/zoom';
import { UsersModule } from '../users/users.module';
import { FileUploadHelper } from '../../common/helpers/file-upload.helpers';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { TaskScheduler } from '../../core/worker/task.scheduler';
import { SchedulerRegistry } from '@nestjs/schedule';
import { PaymentHandler } from '../../common/external/payment/payment.handler';
import { AdminSettingsModule } from '../admin-settings/admin-settings.module';
import { Paystack } from '../../common/external/payment/providers/paystack';
import { PaymentsModule } from '../payments/payments.module';
import { CardsModule } from '../cards/cards.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { Referral, ReferralSchema } from './entities/referral.entity';

@Module({
  imports: [
    UsersModule,
    AdminSettingsModule,
    PaymentsModule,
    CardsModule,
    SubscriptionsModule,
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Referral.name, schema: ReferralSchema },
    ]),
  ],
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService,
    Zoom,
    FileUploadHelper,
    GeneralHelpers,
    TaskScheduler,
    SchedulerRegistry,
    PaymentHandler,
    Paystack,
  ],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
