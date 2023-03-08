import { Injectable } from '@nestjs/common';
import { CreateVitalDto } from './dto/create-vital.dto';
import { UpdateVitalDto } from './dto/update-vital.dto';
import { Model, Types } from 'mongoose';
import { deleteOne, find, findOne, updateOne } from 'src/common/crud/crud';
import { Vital, VitalDocument } from './entities/vital.entity';
import { InjectModel } from '@nestjs/mongoose';
import { QueryVitalDto } from './dto/query.vital.dto';

@Injectable()
export class VitalsService {
  constructor(
    @InjectModel(Vital.name) private vitalModel: Model<VitalDocument>,
  ) {}
  async createVitals(createVitalDto: CreateVitalDto, userId: Types.ObjectId) {
    for (const vitalDtoKey in createVitalDto) {
      await this.vitalModel.updateOne(
        { userId },
        {
          $push: { [vitalDtoKey]: createVitalDto[vitalDtoKey] },
        },
        { upsert: true },
      );
    }
    return await this.findOneUserVitals(userId);
  }

  async findOneUserVitals(userId: Types.ObjectId) {
    return await findOne(this.vitalModel, { userId });
  }

  async findUserVitals(userId: Types.ObjectId) {
    return await find(this.vitalModel, { userId });
  }

  async getOneVitalField(userId: Types.ObjectId, query: QueryVitalDto) {
    const { fieldsToSelect } = query;
    return await findOne(
      this.vitalModel,
      { userId },
      {
        selectFields:
          typeof fieldsToSelect === 'string'
            ? fieldsToSelect
            : [...fieldsToSelect],
      },
    );
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
