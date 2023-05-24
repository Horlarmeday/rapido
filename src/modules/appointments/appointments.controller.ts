import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { VerifyAppointmentTransaction } from './dto/verify-appointment-transaction';
import { QueryDto } from '../../common/helpers/url-query.dto';
import { QueryStatus } from './types/query.types';
import { DoesUserHaveCard } from '../../core/guards/doesUserHaveCard';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { ReferSpecialistDto } from './dto/refer-specialist.dto';
import { EndZoomMeetingDto } from './dto/end-zoom-meeting.dto';
import { MeetingNotesDto } from './dto/meeting-notes.dto';
import { AvailableSpecialistQueryDto } from './dto/available-specialist-query.dto';
import { AvailableTimesDto } from './dto/available-times.dto';

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}
  @UseGuards(DoesUserHaveCard)
  @Post()
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Request() req,
  ) {
    const result = await this.appointmentsService.createAppointment(
      createAppointmentDto,
      req.user,
    );
    return sendSuccessResponse(Messages.CREATED, result);
  }

  @HttpCode(HttpStatus.OK)
  @Post('transactions/verify')
  async verifyTransaction(
    @Body() verifyAppointmentTransaction: VerifyAppointmentTransaction,
  ) {
    const { reference } = verifyAppointmentTransaction;
    const result = await this.appointmentsService.verifyTransaction(reference);
    return sendSuccessResponse(Messages.TRANSACTION_VERIFIED, result);
  }

  @Get('patient')
  async getPatientAppointment(
    @Request() req,
    @Query() queryStatus: QueryStatus,
  ) {
    const result = await this.appointmentsService.getPatientAppointments(
      req.user.sub,
      queryStatus,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get('specialist')
  async getSpecialistAppointment(
    @Request() req,
    @Query() queryStatus: QueryStatus,
  ) {
    const result = await this.appointmentsService.getSpecialistAppointments(
      req.user.sub,
      queryStatus,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get('specialist-referrals')
  async getSpecialistReferrals(@Request() req) {
    const result = await this.appointmentsService.getSpecialistReferrals(
      req.user.sub,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @HttpCode(HttpStatus.OK)
  @Post('available-specialists')
  async getAvailableSpecialists(
    @Body() availableSpecialistQueryDto: AvailableSpecialistQueryDto,
  ) {
    const result = await this.appointmentsService.getAvailableSpecialists(
      availableSpecialistQueryDto,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @HttpCode(HttpStatus.OK)
  @Post('available-times')
  async getAvailableTimes(@Body() availableTimesDto: AvailableTimesDto) {
    const result = await this.appointmentsService.getAvailableTimes(
      availableTimesDto,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get()
  async getAppointments(@Request() req, @Query() queryDto: QueryDto) {
    const result = await this.appointmentsService.getAllAppointments(queryDto);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get(':id')
  async getOneAppointment(@Param('id') id: string) {
    const result = await this.appointmentsService.getOneAppointment(id);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Patch('cancel')
  async cancelAppointment(@Body() cancelAppointmentDto: CancelAppointmentDto) {
    const result = await this.appointmentsService.cancelAppointment(
      cancelAppointmentDto,
    );
    return sendSuccessResponse(Messages.APPOINTMENT_CANCELLED, result);
  }

  @Post('refer-specialist')
  async referPatientToSpecialist(
    @Body() referSpecialistDto: ReferSpecialistDto,
    @Request() req,
  ) {
    const result = await this.appointmentsService.referPatientToSpecialist(
      referSpecialistDto,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.CREATED, result);
  }

  @Patch('end-meeting')
  async endZoomMeeting(@Body() endZoomMeetingDto: EndZoomMeetingDto) {
    const result = await this.appointmentsService.endAppointment(
      endZoomMeetingDto.appointmentId,
    );
    return sendSuccessResponse(Messages.CREATED, result);
  }

  @Patch('meeting-notes')
  async addMeetingNotes(@Body() meetingNotesDto: MeetingNotesDto) {
    const result = await this.appointmentsService.addMeetingNotes(
      meetingNotesDto,
    );
    return sendSuccessResponse(Messages.UPDATED, result);
  }
}
