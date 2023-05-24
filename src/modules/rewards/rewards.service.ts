import { Injectable } from '@nestjs/common';
import { CreateRewardDto } from './dto/create-reward.dto';
import { create, find } from '../../common/crud/crud';
import { InjectModel } from '@nestjs/mongoose';
import {
  Reward,
  RewardActivity,
  RewardDocument,
} from './entities/reward.entity';
import { Model, Types } from 'mongoose';
import moment from 'moment';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
  ) {}
  async createReward(createRewardDto: CreateRewardDto) {
    return await create(this.rewardModel, { ...createRewardDto });
  }

  async giveFreeCheckups(
    userId: Types.ObjectId,
    activity: RewardActivity,
    numb_of_checkup,
  ) {
    return await this.createReward({
      userId,
      activity,
      free_checkups: numb_of_checkup,
      expiry_date: moment().add(1, 'm').toDate(),
    });
  }

  async giveDependantFreeCheckups(
    userId: Types.ObjectId,
    activity: RewardActivity,
    numb_of_checkup,
  ) {
    return await this.createReward({
      userId,
      activity,
      dependant_free_checkups: numb_of_checkup,
      expiry_date: moment().add(1, 'm').toDate(),
    });
  }
  calculatePoints(amountSpent: number): number {
    // Calculate the points based on the amount spent
    return Math.floor(amountSpent / 1000) * 10;
  }

  calculateCashback(amountSpent: number, cashbackPercentage: number): number {
    return (amountSpent * cashbackPercentage) / 100;
  }

  async givePoints(
    userId: Types.ObjectId,
    points: number,
    activity: RewardActivity,
  ) {
    return await this.createReward({
      userId,
      activity,
      points,
      expiry_date: moment().add(1, 'm').toDate(),
    });
  }

  async giveCashback(
    userId: Types.ObjectId,
    points: number,
    activity: RewardActivity,
    amountSpent: number,
  ) {
    return await this.createReward({
      userId,
      activity,
      points,
      cashback: this.calculateCashback(amountSpent, 5),
      expiry_date: moment().add(1, 'm').toDate(),
    });
  }

  async getUserFreeCheckups(userId) {
    return await find(this.rewardModel, {
      userId,
      free_checkups: {
        $gt: 0,
      },
      expiry_date: {
        $gte: moment().toDate(),
      },
    });
  }

  async getDependantFreeCheckups(userId) {
    return await find(this.rewardModel, {
      userId,
      dependant_free_checkups: {
        $gt: 0,
      },
      expiry_date: {
        $gte: moment().toDate(),
      },
    });
  }

  async getUserPoints(userId) {
    return await find(this.rewardModel, {
      userId,
      points: {
        $gt: 0,
      },
      expiry_date: {
        $gte: moment().toDate(),
      },
    });
  }

  reduce(arr, field) {
    return arr.reduce((prevVal, currVal) => prevVal + currVal[field], 0);
  }

  async getUserTotalRewards(userId: Types.ObjectId) {
    const [freeCheckups, points, dependantFreeCheckups] = await Promise.all([
      this.getUserFreeCheckups(userId),
      this.getUserPoints(userId),
      this.getDependantFreeCheckups(userId),
    ]);
    return {
      freeCheckups: this.reduce(freeCheckups, 'free_checkups'),
      dependantFreeCheckups: this.reduce(
        dependantFreeCheckups,
        'dependant_free_checkups',
      ),
      points: this.reduce(points, 'points'),
    };
  }

  async getUserEarnedRewards(userId: Types.ObjectId) {
    return await find(this.rewardModel, {
      userId,
      expiry_date: {
        $gte: moment().toDate(),
      },
    });
  }
}
