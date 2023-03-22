import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserType } from '../../users/entities/user.entity';

export class AppleLoginDto {
  @IsNotEmpty()
  readonly payload: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(UserType)
  readonly user_type: UserType;
}
