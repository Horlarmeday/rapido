import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { PatientAdvancedFilterDto } from '../users/dto/patient-advanced-filter.dto';
import { Types } from 'mongoose';
import { SpecialistAdvancedFilterDto } from '../users/dto/specialist-advanced-filter.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  async create(@Body() createAdminDto: CreateAdminDto) {
    const result = await this.adminService.createAdminAccount(createAdminDto);
    return sendSuccessResponse(Messages.CREATED, result);
  }

  @Get('patients')
  async getPatients(patientAdvancedFilterDto: PatientAdvancedFilterDto) {
    const result = await this.adminService.getPatients(
      patientAdvancedFilterDto,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get('patients/:id')
  async getPatient(@Param('id') id: Types.ObjectId) {
    const result = await this.adminService.getPatient(id);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get('specialists')
  async getSpecialists(
    specialistAdvancedFilterDto: SpecialistAdvancedFilterDto,
  ) {
    const result = await this.adminService.getSpecialists(
      specialistAdvancedFilterDto,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get('specialists/:id')
  async getSpecialist(@Param('id') id: Types.ObjectId) {
    const result = await this.adminService.getSpecialist(id);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }
}
