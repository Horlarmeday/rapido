import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { FileUploadHelper } from '../../common/helpers/file-upload.helpers';
import { TokensModule } from '../tokens/tokens.module';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { UserSettingsModule } from '../user-settings/user-settings.module';
import { TaskScheduler } from '../../core/worker/task.scheduler';
import { SchedulerRegistry } from '@nestjs/schedule';
import {
  SpecialistPreferences,
  SpecialistPreferencesSchema,
} from './entities/specialist-preferences.entity';
import { ReferralsService } from '../referrals/referrals.service';

@Module({
  imports: [
    TokensModule,
    UserSettingsModule,
    ReferralsService,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: SpecialistPreferences.name, schema: SpecialistPreferencesSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    FileUploadHelper,
    GeneralHelpers,
    TaskScheduler,
    SchedulerRegistry,
  ],
  exports: [MongooseModule, UsersService],
})
export class UsersModule {}
