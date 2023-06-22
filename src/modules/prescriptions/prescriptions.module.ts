import { Module } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsController } from './prescriptions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Prescription,
  PrescriptionSchema,
} from './entities/prescription.entity';
import {
  PrescriptionFile,
  PrescriptionFileSchema,
} from './entities/prescription-file.entity';
import { FileUploadHelper } from '../../common/helpers/file-upload.helpers';
import { TaskScheduler } from '../../core/worker/task.scheduler';
import { UsersModule } from '../users/users.module';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Order, OrderSchema } from './entities/order.entity';
import { Drug, DrugSchema } from './entities/drug.entity';
import { PaymentsModule } from '../payments/payments.module';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { PaymentHandler } from '../../common/external/payment/payment.handler';
import { Paystack } from '../../common/external/payment/providers/paystack';
import { AdminSettingsModule } from '../admin-settings/admin-settings.module';
import { Pharmacy, PharmacySchema } from './entities/pharmacy.entity';

@Module({
  imports: [
    UsersModule,
    PaymentsModule,
    AdminSettingsModule,
    MongooseModule.forFeature([
      { name: Prescription.name, schema: PrescriptionSchema },
      { name: PrescriptionFile.name, schema: PrescriptionFileSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Drug.name, schema: DrugSchema },
      { name: Pharmacy.name, schema: PharmacySchema },
    ]),
  ],
  controllers: [PrescriptionsController],
  providers: [
    PrescriptionsService,
    FileUploadHelper,
    TaskScheduler,
    SchedulerRegistry,
    GeneralHelpers,
    PaymentHandler,
    Paystack,
  ],
})
export class PrescriptionsModule {}
