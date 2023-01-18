// // import { Define, InjectQueue, OnQueueReady, Queue } from 'agenda-nest';
// // import { UPLOAD_TO_S3 } from '../constants';
// // import { Agenda, Job } from 'agenda';
// // import { FileUploadHelper } from '../../common/helpers/file-upload.helpers';
// // import { UsersService } from '../../modules/users/users.service';
// // import { InternalServerErrorException, Logger } from '@nestjs/common';
//
// @Queue('rapid_jobs')
// export class RapidCapsulesQueue {
//   private readonly logger = new Logger(RapidCapsulesQueue.name);
//   constructor(
//     @InjectQueue('rapid_jobs') private queue: Agenda,
//     private readonly fileUpload: FileUploadHelper,
//     private readonly usersService: UsersService,
//   ) {}
//   @OnQueueReady()
//   onReady() {
//     console.log('rapid_jobs queue is ready');
//   }
//
//   @Define(UPLOAD_TO_S3)
//   async uploadToS3(job: Job) {
//     try {
//       const { files, userId } = job.attrs.data;
//       this.logger.log('Uploading to S3 bucket');
//       const promises = await Promise.all(
//         files.map((file) => {
//           return this.fileUpload.uploadToS3(file.buffer, file.originalname);
//         }),
//       );
//       this.logger.log(`Finished updating to S3: ${promises}`);
//       const user = await this.usersService.findById(userId);
//       user.pre_existing_conditions?.map((condition, index) => {
//         condition.file = promises[index];
//       });
//       await user.save();
//       this.logger.log(`Updated user profile`);
//     } catch (e) {
//       this.logger.error(`Error occurred, ${e}`);
//       throw new InternalServerErrorException(e);
//     }
//   }
// }
