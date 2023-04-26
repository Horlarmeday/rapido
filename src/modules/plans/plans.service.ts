import { Injectable } from '@nestjs/common';
import { find, findOne } from 'src/common/crud/crud';
import { InjectModel } from '@nestjs/mongoose';
import { Plan, PlanDocument } from './entities/plan.entity';
import { Model, Types } from 'mongoose';

@Injectable()
export class PlansService {
  constructor(@InjectModel(Plan.name) private planModel: Model<PlanDocument>) {}

  async findPlans() {
    return await find(this.planModel, {});
  }

  async findOnePlan(planId: Types.ObjectId): Promise<PlanDocument> {
    return await findOne(this.planModel, { _id: planId });
  }
}
