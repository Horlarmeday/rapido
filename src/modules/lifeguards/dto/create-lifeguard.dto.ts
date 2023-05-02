import {
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Match } from '../../../core/decorators/match.decorators';

export class CreateLifeguardDto {
  @IsNotEmpty()
  @IsString()
  readonly first_name: string;

  @IsNotEmpty()
  @IsString()
  readonly last_name: string;

  @IsString()
  @IsLowercase()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  readonly country_code: string;

  @IsString()
  @MinLength(10, {
    message:
      'Phone number is too short. Minimal length is $constraint1 characters, but actual is $value',
  })
  @MaxLength(10, {
    message:
      'Phone number is too long. Minimal length is $constraint1 characters, but actual is $value',
  })
  @IsNotEmpty()
  readonly phone: string;

  @IsString()
  @IsNotEmpty()
  @Match('password')
  readonly confirm_password: string;
}
