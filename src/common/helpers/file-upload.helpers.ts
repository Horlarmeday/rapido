import {
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
} from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as process from 'process';
@Injectable()
export class FileUploadHelper {
  private readonly logger = new Logger(FileUploadHelper.name);
  async uploadToS3(fileBuffer: Buffer, filename: string) {
    const S3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
    });
    try {
      const location = await S3.upload({
        Bucket: <string>process.env.AWS_BUCKET_NAME,
        Body: fileBuffer,
        Key: `${filename}-${Date.now()}`,
      }).promise();
      this.logger.log(`Successfully uploaded file ${location.Location}`);
      return location.Location;
    } catch (e) {
      this.logger.error('An error occurred uploading file');
      throw new InternalServerErrorException(e);
    }
  }
}
