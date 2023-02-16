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

@Module({
  imports: [
    UsersModule,
    AdminSettingsModule,
    PaymentsModule,
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
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
})
export class AppointmentsModule {}
