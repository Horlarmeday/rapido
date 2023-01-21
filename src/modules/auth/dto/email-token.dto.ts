import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EmailTokenDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email: string;
}
