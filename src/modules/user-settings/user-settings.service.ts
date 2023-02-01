import { Injectable } from '@nestjs/common';
import { create, findOne, updateOne } from '../../common/crud/crud';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserSetting,
  UserSettingsDocument,
} from './entities/user-setting.entity';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectModel(UserSetting.name)
    private userSettingModel: Model<UserSettingsDocument>,
  ) {}

  async create(userId: Types.ObjectId) {
    return await create(this.userSettingModel, { userId });
  }
  async updateSetting(fieldsToUpdate: any, userId: Types.ObjectId) {
    const settings = await this.findOne(userId);
    return await updateOne(
      this.userSettingModel,
      { userId },
      {
        defaults: {
          ...settings.defaults,
          ...fieldsToUpdate.defaults,
        },
      },
    );
  }

  async findOne(id: Types.ObjectId): Promise<UserSettingsDocument> {
    return await findOne(this.userSettingModel, { userId: id });
  }
}
