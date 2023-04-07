import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class MeetingNotesDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNotEmpty()
  appointmentId: Types.ObjectId;
}
