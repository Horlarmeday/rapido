import { Injectable } from '@nestjs/common';
import { CreateVitalDto } from './dto/create-vital.dto';
import { UpdateVitalDto } from './dto/update-vital.dto';
import { Model, Types } from 'mongoose';
import { deleteOne, find, findOne } from 'src/common/crud/crud';
import { Vital, VitalDocument } from './entities/vital.entity';
import { InjectModel } from '@nestjs/mongoose';
import { QueryVitalDto } from './dto/query.vital.dto';
import { VitalChartDataDto } from './dto/vital-chart-data.dto';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import * as moment from 'moment';

@Injectable()
export class VitalsService {
  constructor(
    @InjectModel(Vital.name) private vitalModel: Model<VitalDocument>,
    private readonly generalHelpers: GeneralHelpers,
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
    const vitals = await find(this.vitalModel, { userId });
    return vitals.reduce(
      (
        acc,
        {
          body_temp,
          blood_pressure,
          blood_sugar_level,
          body_weight,
          pulse_rate,
          _id,
          userId,
        },
      ) => {
        if (body_temp?.length) acc.body_temp = body_temp;
        if (blood_pressure?.length) acc.blood_pressure = blood_pressure;
        if (blood_sugar_level?.length)
          acc.blood_sugar_level = blood_sugar_level;
        if (body_weight?.length) acc.body_weight = body_weight;
        if (pulse_rate?.length) acc.pulse_rate = pulse_rate;
        acc.userId = userId;
        acc._id = _id;
        return acc;
      },
      {},
    );
  }

  async getMostRecentVitals(userId: Types.ObjectId) {
    const vitals = await this.findUserVitals(userId);
    const recentVitals = {};
    for (const [key, values] of Object.entries(vitals)) {
      if (Array.isArray(values) && values.length > 0) {
        recentVitals[key] = values.reduce((a, b) =>
          a.updatedAt > b.updatedAt ? a : b,
        );
      }
    }
    return recentVitals;
  }

  async getOneVitalField(userId: Types.ObjectId, query: QueryVitalDto) {
    const { fieldsToSelect } = query;
    return await findOne(
      this.vitalModel,
      { userId },
      {
        ...(fieldsToSelect
          ? {
              selectFields:
                typeof fieldsToSelect === 'string'
                  ? fieldsToSelect
                  : [...fieldsToSelect],
            }
          : {}),
      },
    );
  }

  async updateVitals(
    vitalId: string,
    updateVitalDto: UpdateVitalDto,
    userId: Types.ObjectId,
  ) {
    for (const vitalDtoKey in updateVitalDto) {
      await this.vitalModel.updateOne(
        { _id: vitalId },
        {
          $push: { [vitalDtoKey]: updateVitalDto[vitalDtoKey] },
        },
      );
    }
    return await this.getMostRecentVitals(userId);
  }

  async removeVital(vitalId: string) {
    return await deleteOne(this.vitalModel, { _id: vitalId });
  }

  async getVitalsChartData(
    vitalChartDataDto: VitalChartDataDto,
    userId: Types.ObjectId,
  ) {
    const { vitalToSelect, start_date, end_date } = vitalChartDataDto;
    const vital = await findOne(
      this.vitalModel,
      { userId },
      { selectFields: vitalToSelect },
    );
    const startDate = moment(start_date);
    const endDate = moment(end_date);

    const selectedVital = vital?.[vitalToSelect];
    const data = selectedVital.filter(
      (d) =>
        startDate.isSameOrAfter(d.updatedAt) ||
        endDate.isSameOrBefore(d.updatedAt),
    );
    return this.generalHelpers.groupByDate(data, 'updatedAt');
  }
}
