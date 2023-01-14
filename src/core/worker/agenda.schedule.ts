import { InjectQueue } from 'agenda-nest';
import { UPLOAD_TO_S3 } from '../constants';
import { Agenda } from 'agenda';
import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class RapidCapsulesSchedule {
  private readonly logger = new Logger(RapidCapsulesSchedule.name);
  constructor(@InjectQueue('rapid_jobs') private queue: Agenda) {}

  async uploadToS3(files: Express.Multer.File[], userId: Types.ObjectId) {
    await this.queue.schedule('30 seconds', UPLOAD_TO_S3, {
      files,
      userId,
    });
  }
}
