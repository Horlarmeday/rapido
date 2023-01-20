import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './entities/appointment.entity';
import { Zoom } from '../../common/external/zoom/zoom';
import { UsersModule } from '../users/users.module';
import { FileUploadHelper } from '../../common/helpers/file-upload.helpers';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { MailService } from '../../core/emails/mail.service';

@Module({
  imports: [
    UsersModule,
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
    MailService,
  ],
})
export class AppointmentsModule {}
