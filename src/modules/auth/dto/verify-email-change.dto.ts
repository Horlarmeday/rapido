import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailChangeDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
