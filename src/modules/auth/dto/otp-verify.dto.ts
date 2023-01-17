import { IsNotEmpty, IsString } from 'class-validator';

export class OtpVerifyDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
