import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserType } from '../../users/entities/user.entity';

export class GoogleLoginDto {
  @IsNotEmpty()
  @IsString()
  readonly token: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(UserType)
  readonly user_type: UserType;
}
