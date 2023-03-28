import { Types } from 'mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

export class EndZoomMeetingDto {
  @IsNotEmpty()
  @IsString()
  readonly appointmentId: Types.ObjectId;
}
