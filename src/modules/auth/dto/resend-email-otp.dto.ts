import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResendEmailOtpDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email: string;
}
