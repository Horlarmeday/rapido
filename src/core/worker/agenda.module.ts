import { AgendaModule } from 'agenda-nest';
import { Module } from '@nestjs/common';
import { RapidCapsulesQueue } from './agenda.jobs';
import { UsersService } from '../../modules/users/users.service';
import { FileUploadHelper } from '../../common/helpers/file-upload.helpers';
import { UsersModule } from '../../modules/users/users.module';

@Module({
  imports: [AgendaModule.registerQueue('rapid_jobs'), UsersModule],
  providers: [RapidCapsulesQueue, UsersService, FileUploadHelper],
})
export class RapidCapsulesModule {}
