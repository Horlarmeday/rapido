import { Injectable } from '@nestjs/common';
import { CreateUserSettingDto } from './dto/create-user-setting.dto';
import { findOne, updateOne } from '../../common/crud/crud';
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
  async updateSetting(
    createUserSettingDto: CreateUserSettingDto,
    userId: Types.ObjectId,
  ) {
    return await updateOne(
      this.userSettingModel,
      { userId },
      createUserSettingDto,
    );
  }

  async findOne(id: Types.ObjectId): Promise<UserSettingsDocument> {
    return await findOne(this.userSettingModel, { userId: id });
  }
}
