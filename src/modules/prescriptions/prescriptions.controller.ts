import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  async createPrescription(
    @Body() createPrescriptionDto: CreatePrescriptionDto,
    @Request() req,
  ) {
    const result = await this.prescriptionsService.createPrescription(
      req.user.sub,
      createPrescriptionDto,
    );
    return sendSuccessResponse(Messages.CREATED, result);
  }

  @Get(':id')
  async getOnePrescription(@Param('id') id: Types.ObjectId) {
    const result = await this.prescriptionsService.getOnePrescription(id);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Patch(':id')
  async updatePrescription(
    @Param('id') id: Types.ObjectId,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
  ) {
    const result = await this.prescriptionsService.updatePrescription(
      id,
      updatePrescriptionDto,
    );
    return sendSuccessResponse(Messages.UPDATED, result);
  }

  @Patch(':id/sent')
  async sendPrescription(@Param('id') id: Types.ObjectId) {
    const result = await this.prescriptionsService.sendPrescription(id);
    return sendSuccessResponse(Messages.PRESCRIPTION_SENT, result);
  }

  @Delete(':id')
  async deletePrescription(@Param('id') id: Types.ObjectId) {
    const result = await this.prescriptionsService.deletePrescription(id);
    return sendSuccessResponse(Messages.DELETED, result);
  }
}
