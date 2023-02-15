import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResendPhoneOtpDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email: string;
}
