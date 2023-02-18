import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
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
}
