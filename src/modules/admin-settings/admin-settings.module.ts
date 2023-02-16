import { Module } from '@nestjs/common';
import { AdminSettingsService } from './admin-settings.service';
import { AdminSettingsController } from './admin-settings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AdminSetting,
  AdminSettingSchema,
} from './entities/admin-setting.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminSetting.name, schema: AdminSettingSchema },
    ]),
  ],
  controllers: [AdminSettingsController],
  providers: [AdminSettingsService],
  exports: [AdminSettingsService],
})
export class AdminSettingsModule {}
