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
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { InitializeAppointmentTransaction } from './dto/initialize-appointment-transaction';
import { VerifyAppointmentTransaction } from './dto/verify-appointment-transaction';
import { QueryDto } from '../../common/helpers/url-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

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
  @Post('transactions/initialize')
  async initializeTransaction(
    @Request() req,
    @Body() initAppointmentTz: InitializeAppointmentTransaction,
  ) {
    const result = await this.appointmentsService.initializeTransaction(
      req.user.sub,
      initAppointmentTz,
    );
    return sendSuccessResponse(Messages.TRANSACTION_INITIALIZED, result);
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
  async getPatientAppointment(@Request() req) {
    const result = await this.appointmentsService.getPatientAppointments(
      req.user.sub,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get('specialist')
  async getSpecialistAppointment(@Request() req) {
    const result = await this.appointmentsService.getSpecialistAppointments(
      req.user.sub,
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
}
