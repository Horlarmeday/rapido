import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as process from 'process';

@Injectable()
export class FileUploadHelper {
  private S3: AWS.S3;
  constructor() {
    this.S3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
    });
  }
  async uploadToS3(fileBuffer: Buffer, filename: string) {
    try {
      const location = await this.S3.upload({
        Bucket: <string>process.env.AWS_BUCKET_NAME,
        Body: fileBuffer,
        Key: `${Date.now()}-${filename}`,
      }).promise();
      return location.Location;
    } catch (e) {
      throw new InternalServerErrorException('Error uploading to S3', e);
    }
  }

  async readAndDownloadFile() {
    try {
      // Set the parameters for the download
      const params = {
        Bucket: <string>process.env.AWS_BUCKET_NAME,
        Key: `AuthKey_${process.env.APPLE_KEY_ID}.p8`,
      };

      // Download the file from S3
      const data = await this.S3.getObject(params).promise();
      return data.Body?.toString('utf-8');
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
