import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
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
    const result = await this.appointmentsService.create(
      createAppointmentDto,
      req.user,
    );
    return sendSuccessResponse(Messages.CREATED, result);
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
