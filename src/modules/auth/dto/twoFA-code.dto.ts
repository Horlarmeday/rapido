import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class TwoFACodeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  code: string;
}
