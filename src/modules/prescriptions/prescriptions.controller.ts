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
import { UploadPrescriptionDto } from './dto/upload-prescription.dto';
import { SendPatientPrescriptionDto } from './dto/send-patient-prescription.dto';
import { SendPharmacyPrescriptionDto } from './dto/send-pharmacy-prescription.dto';
import { StartOrderPaymentDto } from './dto/start-order-payment.dto';
import { VerifyOrderPaymentDto } from './dto/verify-order-payment.dto';
import { ConfirmOrderDto } from './dto/confirm-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

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

  @Post('file')
  async uploadPrescription(
    @Body() uploadPrescriptionDto: UploadPrescriptionDto,
    @Request() req,
  ) {
    const result = await this.prescriptionsService.uploadPrescription(
      req.user.sub,
      uploadPrescriptionDto,
    );
    return sendSuccessResponse(Messages.CREATED, result);
  }

  @Post('start-payment')
  async startOrderPayment(
    @Body() startOrderPaymentDto: StartOrderPaymentDto,
    @Request() req,
  ) {
    const result = await this.prescriptionsService.startOrderPayment(
      req.user.sub,
      startOrderPaymentDto.amount,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get()
  async getPrescriptions(@Request() req) {
    const result = await this.prescriptionsService.getPrescriptions(
      req.user.sub,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get('internal')
  async getInternalPrescriptions(@Request() req) {
    const result = await this.prescriptionsService.getPrescriptionsByUser(
      req.user.sub,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get('external')
  async getExternalPrescriptions(@Request() req) {
    const result = await this.prescriptionsService.getPrescriptionFilesByUser(
      req.user.sub,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get('orders')
  async getPatientOrders(@Request() req) {
    const result = await this.prescriptionsService.getPatientOrders(
      req.user.sub,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get('orders/:id')
  async getPatientOrder(@Param('id') id: Types.ObjectId) {
    const result = await this.prescriptionsService.getOneOrder(id);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get(':id')
  async getOnePrescription(@Param('id') id: Types.ObjectId) {
    const result = await this.prescriptionsService.getOnePrescription(id);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Patch('send-patient')
  async sendPrescriptionToPatient(
    @Body() sendPatientPrescriptionDto: SendPatientPrescriptionDto,
  ) {
    const result = await this.prescriptionsService.sendPrescriptionToPatient(
      sendPatientPrescriptionDto,
    );
    return sendSuccessResponse(Messages.PRESCRIPTION_SENT, result);
  }

  @Patch('send-pharmacy')
  async sendPrescriptionToPharmacy(
    @Body() sendPharmacyPrescriptionDto: SendPharmacyPrescriptionDto,
    @Request() req,
  ) {
    const result = await this.prescriptionsService.sendPrescriptionToPharmacy(
      sendPharmacyPrescriptionDto,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.PRESCRIPTION_SENT, result);
  }

  @Patch('verify-payment')
  async verifyOrderPayment(
    @Body() verifyOrderPaymentDto: VerifyOrderPaymentDto,
  ) {
    const result = await this.prescriptionsService.verifyOrderPayment(
      verifyOrderPaymentDto,
    );
    return sendSuccessResponse(Messages.TRANSACTION_VERIFIED, result);
  }

  @Patch('orders/confirm')
  async confirmOrder(@Body() confirmOrderDto: ConfirmOrderDto) {
    const result = await this.prescriptionsService.confirmOrder(
      confirmOrderDto.orderId,
    );
    return sendSuccessResponse(Messages.UPDATED, result);
  }

  @Patch('orders/:id')
  async updateOrder(
    @Param('id') id: Types.ObjectId,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const result = await this.prescriptionsService.updateOrder(
      id,
      updateOrderDto,
    );
    return sendSuccessResponse(Messages.UPDATED, result);
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

  @Delete(':id')
  async deletePrescription(@Param('id') id: Types.ObjectId) {
    const result = await this.prescriptionsService.deletePrescription(id);
    return sendSuccessResponse(Messages.DELETED, result);
  }
}
