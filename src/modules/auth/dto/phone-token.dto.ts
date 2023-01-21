import { IsNotEmpty, IsString } from 'class-validator';

export class PhoneTokenDto {
  @IsNotEmpty()
  @IsString()
  readonly phone: string;
}
