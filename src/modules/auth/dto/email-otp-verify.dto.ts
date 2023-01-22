import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EmailOtpVerifyDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
