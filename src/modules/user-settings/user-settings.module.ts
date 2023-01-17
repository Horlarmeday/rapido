import { Module } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UserSettingsController } from './user-settings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSetting, UserSettingSchema } from './entities/user-setting.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserSetting.name, schema: UserSettingSchema },
    ]),
  ],
  controllers: [UserSettingsController],
  providers: [UserSettingsService],
  exports: [UserSettingsService],
})
export class UserSettingsModule {}
