import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { InjectModel } from '@nestjs/mongoose';
import ical, {
  ICalAttendeeData,
  ICalAttendeeStatus,
  ICalAttendeeType,
  ICalCalendarMethod,
  ICalEventStatus,
} from 'ical-generator';
import { Model, Types } from 'mongoose';
import {
  Appointment,
  AppointmentDocument,
} from './entities/appointment.entity';
import { Zoom } from '../../common/external/zoom/zoom';
import { UsersService } from '../users/users.service';
import { IJwtPayload } from '../auth/types/jwt-payload.type';
import * as moment from 'moment';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { appointmentScheduleEmail } from '../../core/emails/mails/appointmentScheduleEmail';
import { FAILED, PENDING, SUCCESS } from '../../core/constants';
import {
  countDocuments,
  create,
  find,
  findAndCountAll,
  findById,
  updateOne,
} from 'src/common/crud/crud';
import { TaskScheduler } from '../../core/worker/task.scheduler';
import { User } from '../users/entities/user.entity';
import { ICalendarType } from './types/apointment.types';
import { Messages } from '../../core/messages/messages';
import { QueryDto } from '../../common/helpers/url-query.dto';
import { PaymentHandler } from '../../common/external/payment/payment.handler';
import { AdminSettingsService } from '../admin-settings/admin-settings.service';
import { PaymentsService } from '../payments/payments.service';
import { PaymentFor, Status } from '../payments/entities/payment.entity';
import { InitializeAppointmentTransaction } from './dto/initialize-appointment-transaction';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);
  constructor(
    @InjectModel(Appointment.name)
    private AppointmentModel: Model<AppointmentDocument>,
    private readonly zoom: Zoom,
    private readonly usersService: UsersService,
    private readonly generalHelpers: GeneralHelpers,
    private readonly taskCron: TaskScheduler,
    private readonly paymentHandler: PaymentHandler,
    private readonly adminSettingsService: AdminSettingsService,
    private readonly paymentService: PaymentsService,
  ) {}
  async createAppointment(
    createAppointmentDto: CreateAppointmentDto,
    currentUser: IJwtPayload,
  ) {
    return await create(this.AppointmentModel, {
      ...createAppointmentDto,
      patient: currentUser.sub,
    });
  }

  async findOneAppointment(appointmentId: Types.ObjectId) {
    return await findById(this.AppointmentModel, appointmentId);
  }

  async updateAppointment(query: any, fieldsToUpdate: any) {
    return await updateOne(
      this.AppointmentModel,
      { ...query },
      { ...fieldsToUpdate },
    );
  }

  async scheduleZoomMeeting(appointment: AppointmentDocument) {
    const [specialist, patient] = await Promise.all([
      this.usersService.findById(appointment.specialist),
      this.usersService.findById(appointment.patient),
    ]);
    const topic = `Appointment Between ${specialist.profile.first_name} and ${patient.profile.first_name}`;
    const response = await this.zoom.createMeeting({
      start_time: appointment.start_time,
      topic,
    });

    if (response.status === SUCCESS) {
      const { join_url, start_url, id } = response.data;
      await updateOne(
        this.AppointmentModel,
        { _id: appointment._id },
        {
          meeting_id: id,
          join_url,
          start_url,
          payment_status: Status.SUCCESSFUL,
        },
      );
      await this.taskCron.addCron(
        this.sendScheduledAppointment({
          patient,
          specialist,
          start_time: appointment.start_time,
          topic,
          link: { join_url, start_url },
        }),
        `${Date.now()}-sendScheduleAppointmentMail`,
      );

      return appointment;
    }
  }

  generateICalendar({
    patient,
    specialist,
    start_time,
    topic,
    link,
  }: ICalendarType) {
    const DURATION = 45;
    const attendees = this.getAttendees([patient, specialist]);

    const cal = ical({
      name: topic,
      method: ICalCalendarMethod.REQUEST,
      events: [
        {
          start: start_time,
          end: moment(start_time).add(DURATION, 'm').toDate(),
          summary: `${specialist.full_name} and ${patient.full_name}`,
          location: 'Zoom',
          timezone: 'Africa/Lagos',
          description: `${topic}\n\n Join the meeting via this zoom link ${link.join_url}`,
          status: ICalEventStatus.CONFIRMED,
          attendees,
        },
      ],
    });
    const attachments = [
      {
        filename: `invite.ics`,
        content: cal.toString(),
        contentType: 'text/calendar',
      },
    ];
    this.logger.log(`Finished generating ical attachment`);
    return { attendees, attachments };
  }

  sendScheduledAppointment({
    patient,
    specialist,
    start_time,
    topic,
    link,
  }: ICalendarType) {
    this.logger.log(`Getting generated ical attachment`);
    const { attachments, attendees } = this.generateICalendar({
      patient,
      specialist,
      start_time,
      topic,
      link,
    });
    const { join_url, start_url } = link;
    for (const attendee of attendees) {
      const isPatient = patient.profile.contact.email === attendee.email;
      this.generalHelpers.generateEmailAndSend({
        email: <string>attendee.email,
        subject: topic,
        emailBody: appointmentScheduleEmail(
          isPatient ? join_url : start_url,
          attendees,
        ),
        attachments,
      });
      this.logger.log(`Sent appointment invite to ${attendee.name}`);
    }
    return true;
  }

  getAttendees(participants: User[]): ICalAttendeeData[] {
    return participants.map(({ profile, full_name }) => ({
      email: profile.contact.email,
      name: full_name,
      mailto: profile.contact.email,
      status: ICalAttendeeStatus.NEEDSACTION,
      rsvp: true,
      type: ICalAttendeeType.INDIVIDUAL,
    }));
  }

  async initializeTransaction(
    userId: Types.ObjectId,
    initAppointmentTz: InitializeAppointmentTransaction,
  ) {
    const user = await this.usersService.findById(userId);
    const reference = this.generalHelpers.genTxReference();
    const {
      defaults: { appointment_fee },
    } = await this.adminSettingsService.findOne();
    const metadata = {
      name: user.full_name,
      email: user.profile.contact.email,
      appointment_id: initAppointmentTz.appointmentId,
      payment_for: PaymentFor.APPOINTMENT,
    };
    const response = await this.paymentHandler.initializeTransaction(
      user.profile.contact.email,
      appointment_fee,
      reference,
      metadata,
    );
    if (response.status === SUCCESS) {
      await this.paymentService.create(
        userId,
        reference,
        appointment_fee,
        PaymentFor.APPOINTMENT,
      );
    }
    return response.data;
  }

  async verifyTransaction(reference: string) {
    const response = await this.paymentHandler.verifyTransaction(reference);
    switch (response?.data?.status) {
      case SUCCESS:
        const appointmentId = response.data.metadata.appointment_id;
        const appointment = await this.findOneAppointment(appointmentId);
        await this.scheduleZoomMeeting(appointment);
        await this.paymentService.updatePayment(reference, {
          status: Status.SUCCESSFUL,
          metadata: {
            appointment_id: appointmentId,
          },
        });
        return await this.findOneAppointment(appointmentId);
      case FAILED:
        const appointmentId1 = response.data.metadata.appointment_id;
        await this.updateAppointment(
          { _id: appointmentId1 },
          {
            payment_status: Status.FAILED,
          },
        );
        await this.paymentService.updatePayment(reference, {
          status: Status.FAILED,
          metadata: {
            appointment_id: appointmentId1,
          },
        });
        return await this.findOneAppointment(appointmentId1);
      case PENDING:
        const appointmentId2 = response.data.metadata.appointment_id;
        return await this.findOneAppointment(appointmentId2);
    }
  }

  async getPatientAppointments(userId: Types.ObjectId) {
    return await find(this.AppointmentModel, { patient: userId });
  }

  async getSpecialistAppointments(userId: Types.ObjectId) {
    return await find(this.AppointmentModel, { specialist: userId });
  }

  async getAllAppointments(query: QueryDto) {
    const { currentPage, pageLimit } = query;
    const { limit, offset } = this.generalHelpers.calcLimitAndOffset(
      +currentPage,
      pageLimit,
    );
    const appointments = await findAndCountAll(
      this.AppointmentModel,
      {},
      limit,
      offset,
    );

    return this.generalHelpers.paginate(
      appointments,
      +currentPage,
      limit,
      await countDocuments(this.AppointmentModel),
    );
  }

  async getOneAppointment(appointmentId: string) {
    const appointment = await findById(
      this.AppointmentModel,
      <Types.ObjectId>(<unknown>appointmentId),
    );
    if (!appointment) throw new NotFoundException(Messages.NOT_FOUND);
    return appointment;
  }
}
