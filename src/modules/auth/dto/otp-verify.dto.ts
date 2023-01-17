import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class OtpVerifyDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
