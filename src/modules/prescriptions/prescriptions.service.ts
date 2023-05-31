import { Injectable } from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Prescription,
  PrescriptionDocument,
} from './entities/prescription.entity';
import { Model, Types } from 'mongoose';
import {
  create,
  deleteOne,
  findOne,
  updateOneAndReturn,
} from '../../common/crud/crud';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectModel(Prescription.name)
    private prescriptionModel: Model<PrescriptionDocument>,
  ) {}
  async createPrescription(
    userId: Types.ObjectId,
    createPrescriptionDto: CreatePrescriptionDto,
  ) {
    return await create(this.prescriptionModel, {
      ...createPrescriptionDto,
      prescribed_by: userId,
    });
  }

  async getOnePrescription(prescriptionId: Types.ObjectId) {
    return await findOne(
      this.prescriptionModel,
      { _id: prescriptionId },
      {
        populate: 'patient',
        populateSelectFields: ['profile.first_name', 'profile.last_name'],
      },
    );
  }

  async updatePrescription(
    prescriptionId: Types.ObjectId,
    updatePrescriptionDto: UpdatePrescriptionDto,
  ) {
    return await updateOneAndReturn(
      this.prescriptionModel,
      { _id: prescriptionId },
      { ...updatePrescriptionDto },
    );
  }

  async sendPrescription(prescriptionId: Types.ObjectId) {
    return await updateOneAndReturn(
      this.prescriptionModel,
      { _id: prescriptionId },
      { is_sent_to_patient: true },
    );
  }

  async deletePrescription(prescriptionId: Types.ObjectId) {
    return await deleteOne(this.prescriptionModel, { _id: prescriptionId });
  }
}
