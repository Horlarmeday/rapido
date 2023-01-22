import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class PhoneTokenDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(11)
  readonly phone: string;
}
