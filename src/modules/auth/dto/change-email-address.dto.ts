import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChangeEmailAddressDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}
