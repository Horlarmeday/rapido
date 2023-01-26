import {
  IsEmail,
  IsEnum,
  IsLowercase,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Match } from '../../../core/decorators/match.decorators';
import { Type } from 'class-transformer';
import { UserType } from '../entities/user.entity';

export class CreateUserDto {
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
  // @IsStrongPassword({ minLength: 6, minNumbers: 1, minLowercase: 1 })
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @Match('password')
  readonly confirm_password: string;

  @IsNotEmpty()
  readonly date_of_birth: Date;

  @Type(() => Boolean)
  readonly terms: boolean;

  @Type(() => Boolean)
  readonly marketing: boolean;

  @IsEnum(UserType)
  readonly user_type: UserType;
}
