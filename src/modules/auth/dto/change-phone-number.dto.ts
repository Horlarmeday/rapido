import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePhoneNumberDto {
  @IsString()
  @IsNotEmpty()
  country_code: string;
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
  phone: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}
