import { IsNotEmpty, IsString } from 'class-validator';
import { Match } from '../../../core/decorators/match.decorators';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  // @IsStrongPassword({ minLength: 6, minNumbers: 1, minLowercase: 1 })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Match('password')
  confirm_password: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
