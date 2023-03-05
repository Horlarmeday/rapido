import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyCardDto {
  @IsNotEmpty()
  @IsString()
  reference: string;
}
