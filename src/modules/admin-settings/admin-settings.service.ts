import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AdminSetting,
  AdminSettingsDocument,
} from './entities/admin-setting.entity';
import { findOne } from '../../common/crud/crud';

@Injectable()
export class AdminSettingsService {
  constructor(
    @InjectModel(AdminSetting.name)
    private adminSettingModel: Model<AdminSettingsDocument>,
  ) {}

  async findOne(): Promise<AdminSettingsDocument> {
    return await findOne(this.adminSettingModel, {});
  }
}
