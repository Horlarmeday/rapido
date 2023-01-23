import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class PhoneVerifyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(11)
  phone: string;
}
