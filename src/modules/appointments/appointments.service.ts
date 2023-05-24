import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { isEmpty } from 'lodash';
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
  AppointmentStatus,
} from './entities/appointment.entity';
import { MeetingStatus, Zoom } from '../../common/external/zoom/zoom';
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
  upsert,
} from 'src/common/crud/crud';
import { TaskScheduler } from '../../core/worker/task.scheduler';
import { User, UserDocument, UserType } from '../users/entities/user.entity';
import { ICalendarType } from './types/appointment.types';
import { Messages } from '../../core/messages/messages';
import { QueryDto } from '../../common/helpers/url-query.dto';
import { PaymentHandler } from '../../common/external/payment/payment.handler';
import { AdminSettingsService } from '../admin-settings/admin-settings.service';
import { PaymentsService } from '../payments/payments.service';
import { Status } from '../payments/entities/payment.entity';
import { QueryStatus } from './types/query.types';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { ReferSpecialistDto } from './dto/refer-specialist.dto';
import {
  AppointmentReferral,
  AppointmentReferralDocument,
} from './entities/referral.entity';
import { MeetingNotesDto } from './dto/meeting-notes.dto';
import {
  RatingFilter,
  AvailableSpecialistQueryDto,
} from './dto/available-specialist-query.dto';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(AppointmentReferral.name)
    private referralModel: Model<AppointmentReferralDocument>,
    private readonly zoom: Zoom,
    private readonly usersService: UsersService,
    private readonly generalHelpers: GeneralHelpers,
    private readonly taskCron: TaskScheduler,
    private readonly paymentHandler: PaymentHandler,
    private readonly adminSettingsService: AdminSettingsService,
    private readonly paymentService: PaymentsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}
  async createAppointment(
    createAppointmentDto: CreateAppointmentDto,
    currentUser: IJwtPayload,
  ) {
    const subscription = await this.subscriptionsService.getActiveSubscription(
      currentUser.sub,
    );
    const appointment = await create(this.appointmentModel, {
      ...createAppointmentDto,
      start_time: new Date(
        `${createAppointmentDto.date}:${createAppointmentDto.time}`,
      ),
      patient: currentUser.sub,
      meeting_class: subscription?.planId?.name || 'Free',
    });
    return await this.scheduleZoomMeeting(appointment);
  }

  async findOneAppointment(appointmentId: Types.ObjectId) {
    const appointment = await findById(this.appointmentModel, appointmentId);
    if (!appointment)
      throw new NotFoundException(Messages.APPOINTMENT_NOT_FOUND);
    return appointment;
  }

  async updateAppointment(query: any, fieldsToUpdate: any) {
    return await updateOne(
      this.appointmentModel,
      { ...query },
      { ...fieldsToUpdate },
    );
  }

  async cancelAppointment(cancelAppointmentDto: CancelAppointmentDto) {
    const { appointmentId } = cancelAppointmentDto;
    const appointment = await this.findOneAppointment(appointmentId);
    const response = await this.zoom.cancelMeeting(
      appointment.meeting_id,
      MeetingStatus.END,
    );

    if (response.statusCode === 204) {
      await this.updateAppointment(
        { _id: appointmentId },
        { status: AppointmentStatus.CANCELLED },
      );
    }
  }

  async scheduleZoomMeeting(appointment: AppointmentDocument) {
    const [specialist, patient] = await Promise.all([
      this.usersService.findById(appointment.specialist),
      this.usersService.findById(appointment.patient),
    ]);
    const subscription = await this.subscriptionsService.getActiveSubscription(
      patient.id,
    );
    const topic = `Appointment Between ${specialist.profile.first_name} and ${patient.profile.first_name}`;
    const response = await this.zoom.createMeeting({
      start_time: appointment.start_time,
      topic,
      duration: subscription?.planId?.call_duration ?? '5',
    });

    if (response.status === SUCCESS) {
      const { join_url, start_url, id } = response.data;
      await updateOne(
        this.appointmentModel,
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
          call_duration: subscription?.planId?.call_duration,
          appointmentId: appointment._id,
        }),
        `${Date.now()}-sendScheduleAppointmentMail`,
      );

      return appointment;
    }
    return appointment;
  }

  generateICalendar({
    patient,
    specialist,
    start_time,
    topic,
    link,
    call_duration,
    appointmentId,
  }: ICalendarType) {
    const DURATION = call_duration || 5;
    const attendees = this.getAttendees([patient, specialist]);

    const cal = ical({
      name: topic,
      method: ICalCalendarMethod.REQUEST,
      events: [
        {
          id: <string>(<unknown>appointmentId),
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
    this.logger.log(`Finished generating ics attachment`);
    return { attendees, attachments };
  }

  sendScheduledAppointment({
    patient,
    specialist,
    start_time,
    topic,
    link,
    call_duration,
    appointmentId,
  }: ICalendarType) {
    this.logger.log(`Getting generated ical attachment`);
    const { attachments, attendees } = this.generateICalendar({
      patient,
      specialist,
      start_time,
      topic,
      link,
      call_duration,
      appointmentId,
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

  async verifyTransaction(reference: string) {
    const response = await this.paymentHandler.verifyTransaction(reference);
    try {
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
          const appointmentId2 = response.data.metadata?.appointment_id;
          return await this.findOneAppointment(appointmentId2);
        default:
          const appointmentId3 = response.data.metadata?.appointment_id;
          return await this.findOneAppointment(appointmentId3);
      }
    } catch (e) {
      this.logger.error('An error occurred verifying appointment', e);
      throw new InternalServerErrorException(e, 'An error occurred');
    }
  }

  async getPatientAppointments(
    userId: Types.ObjectId,
    queryStatus: QueryStatus,
  ) {
    const { status } = queryStatus || {};
    return await find(this.appointmentModel, {
      patient: userId,
      ...(!isEmpty(status) && { status }),
    });
  }

  async getSpecialistAppointments(
    userId: Types.ObjectId,
    queryStatus: QueryStatus,
  ) {
    const { status } = queryStatus || {};
    return await find(this.appointmentModel, {
      specialist: userId,
      ...(status && { status }),
    });
  }

  async getAppointments(query) {
    return (await find(this.appointmentModel, {
      ...query,
    })) as AppointmentDocument[];
  }

  convertTimeIntoStringFormatted(time_taken) {
    const hours = Math.floor(time_taken / 60);
    const minutes = time_taken % 60;
    const seconds = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  async endAppointment(appointmentId: Types.ObjectId) {
    const appointment = await this.findOneAppointment(appointmentId);
    const response = await this.zoom.getPastMeetingDetails(
      appointment.meeting_id,
    );
    if (response.status === SUCCESS) {
      await this.updateAppointment(
        { _id: appointmentId },
        {
          status: AppointmentStatus.COMPLETED,
          call_duration: {
            time_taken: response.data.total_minutes,
            unit: 'Minutes',
            formatted_string: this.convertTimeIntoStringFormatted(
              response?.data?.total_minutes,
            ),
          },
        },
      );
    }
    return appointment;
  }

  async getAllAppointments(query: QueryDto) {
    const { currentPage, pageLimit, filterBy, search } = query;
    const { limit, offset } = this.generalHelpers.calcLimitAndOffset(
      +currentPage,
      pageLimit,
    );

    let result: { appointments: AppointmentDocument[]; count: number };

    if (search) {
      result = await this.searchAppointments(filterBy, limit, offset, search);
    } else {
      result = await this.queryAppointments(filterBy, limit, offset);
    }

    return this.generalHelpers.paginate(
      result.appointments,
      +currentPage,
      limit,
      result.count,
    );
  }

  async queryAppointments(
    filterBy: string | undefined,
    limit: number,
    offset: number,
  ): Promise<{ appointments: AppointmentDocument[]; count: number }> {
    const query = {
      ...(filterBy && filterBy === 'All' ? {} : { status: filterBy }),
    };
    const appointments = (await findAndCountAll({
      model: this.appointmentModel,
      query,
      limit,
      offset,
    })) as AppointmentDocument[];
    return {
      appointments,
      count: await countDocuments(this.appointmentModel, { ...query }),
    };
  }

  async searchAppointments(
    filterBy: string | undefined,
    limit: number,
    offset: number,
    search: string,
  ): Promise<{ appointments: AppointmentDocument[]; count: number }> {
    const query = {
      ...(filterBy && filterBy === 'All' ? {} : { status: filterBy }),
      $text: { $search: search },
    };
    const appointments = (await findAndCountAll({
      model: this.appointmentModel,
      query,
      limit,
      offset,
      displayScore: true,
    })) as AppointmentDocument[];
    return {
      appointments,
      count: await countDocuments(this.appointmentModel, { ...query }),
    };
  }

  async getOneAppointment(appointmentId: string) {
    const appointment = await findById(
      this.appointmentModel,
      <Types.ObjectId>(<unknown>appointmentId),
    );
    if (!appointment) throw new NotFoundException(Messages.NOT_FOUND);
    return appointment;
  }

  async referPatientToSpecialist(
    referSpecialistDto: ReferSpecialistDto,
    userId: Types.ObjectId,
  ) {
    return await create(this.referralModel, {
      ...referSpecialistDto,
      referred_by: userId,
    });
  }

  async getSpecialistReferrals(userId) {
    return await find(
      this.referralModel,
      { 'specialists.id': userId },
      { populate: 'appointment' },
    );
  }

  async addMeetingNotes(meetingNotesDto: MeetingNotesDto) {
    return await upsert(
      this.appointmentModel,
      { _id: meetingNotesDto.appointmentId },
      { $push: { notes: { ...meetingNotesDto } } },
    );
  }

  isTimeInRange(
    preferredTime: moment.MomentInput,
    startTime: moment.MomentInput,
    endTime: moment.MomentInput,
  ) {
    const format = 'HH:mm:ss';
    const time = moment(preferredTime, format);
    const beforeTime = moment(startTime, format);
    const afterTime = moment(endTime, format);
    return time.isBetween(beforeTime, afterTime, undefined, '[]');
  }

  ratingsQuery(rating: RatingFilter) {
    switch (rating) {
      case RatingFilter.ONE_STAR_AND_ABOVE:
        return { average_rating: { $gte: 1 } };
      case RatingFilter.TWO_STARS_AND_ABOVE:
        return { average_rating: { $gte: 2 } };
      case RatingFilter.THREE_STARS_AND_ABOVE:
        return { average_rating: { $gte: 3 } };
      case RatingFilter.FOUR_STARS_AND_ABOVE:
        return { average_rating: { $gte: 4 } };
      case RatingFilter.FIVE_STARS:
        return { average_rating: { $eq: 5 } };
    }
  }

  async getAvailableSpecialists(
    availableSpecialistQueryDto: AvailableSpecialistQueryDto,
  ) {
    const {
      specialist_category,
      professional_category,
      availabilityDates,
      rating,
      time_zone,
      gender,
    } = availableSpecialistQueryDto || {};
    // find all specialist of that professional category and get their Ids
    const specialists = await this.usersService.findAllUsers({
      user_type: UserType.SPECIALIST,
      'professional_practice.category': professional_category,
      'professional_practice.area_of_specialty': specialist_category,
      ...(rating && this.ratingsQuery(rating)),
    });
    const specialistIds = specialists.map(({ _id }) => _id);
    // Use the ids to fetch their preferences
    // If (gender / rating), filter specialists whose preferences those fields
    const preferences = await this.usersService.getPreferences({
      userId: specialistIds,
      ...(gender && { 'preferences.gender': gender }),
      ...(time_zone && { 'preferences.timezone': time_zone }),
    });

    /**
     * Fetch the specialists that their preference day and time
     * falls between the patient preferred day and time for the appointment
     **/
    const result: { [x: string]: UserDocument[] } = {};
    await Promise.all(
      availabilityDates.map(async ({ date, time }) => {
        const daysOfTheWeek = this.generalHelpers.daysOfTheWeek();
        const preferredDay = daysOfTheWeek[moment(date).isoWeekday()];
        const availablePreferences = preferences.filter(
          ({ time_availability }) =>
            time_availability.find(
              ({ day, start_time, end_time }) =>
                day === preferredDay &&
                this.isTimeInRange(time, start_time, end_time),
            ),
        );
        const userIds = availablePreferences.map(({ userId }) => userId);
        const availableSpecialists = await Promise.all(
          userIds.filter(async (userId) => {
            // get all the specialist appointments for that day if any
            const appointments = await this.getAppointments({
              userId,
              $or: [
                { status: AppointmentStatus.OPEN },
                { status: AppointmentStatus.ONGOING },
              ],
              start_time: {
                $gte: new Date(new Date(date).setHours(0, 0, 0)),
                $lte: new Date(new Date(date).setHours(23, 59, 59)),
              },
            });
            // check if the time patient selects does not coincide with an appointment time of the specialist

            return (
              !appointments?.length ||
              !appointments.some(({ start_time }) => {
                const endTime = moment(start_time)
                  .add(1, 'hour')
                  .format('HH:mm');
                return this.isTimeInRange(time, start_time, endTime);
              })
            );
          }),
        );

        result[moment(date).format('YYYY-MM-DD')] =
          await this.usersService.findAllUsers(
            {
              _id: availableSpecialists,
            },
            [
              'profile.first_name',
              'profile.last_name',
              'average_rating',
              'professional_practice.years_of_practice',
            ],
          );
      }),
    );
    // Send the remaining specialist to the client
    return result;
  }

  /**
   * TODO: create a job to change appointment status to ongoing
   * when meeting going on
   */
}
