import { Injectable } from '@nestjs/common';
import { CreateVitalDto } from './dto/create-vital.dto';
import { UpdateVitalDto } from './dto/update-vital.dto';
import { Model, Types } from 'mongoose';
import { create, deleteOne, find, updateOne } from 'src/common/crud/crud';
import { Vital, VitalDocument } from './entities/vital.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class VitalsService {
  constructor(
    @InjectModel(Vital.name) private vitalModel: Model<VitalDocument>,
  ) {}
  async createVitals(createVitalDto: CreateVitalDto, userId: Types.ObjectId) {
    return await create(this.vitalModel, { ...createVitalDto, userId });
  }

  async findUserVitals(userId: Types.ObjectId) {
    return await find(this.vitalModel, { userId });
  }

  async updateVitals(vitalId: string, updateVitalDto: UpdateVitalDto) {
    return await updateOne(
      this.vitalModel,
      { _id: vitalId },
      { ...updateVitalDto },
    );
  }

  async removeVital(vitalId: string) {
    return await deleteOne(this.vitalModel, { _id: vitalId });
  }
}
