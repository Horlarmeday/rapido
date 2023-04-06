import {
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsString,
} from 'class-validator';
import { UserType } from '../../users/entities/user.entity';
import { AppleResponseType } from '../strategies/appleAuth.strategy';

export class AppleLoginDto {
  @IsNotEmpty()
  @IsNotEmptyObject()
  readonly payload: AppleResponseType;

  @IsNotEmpty()
  @IsString()
  @IsEnum(UserType)
  readonly user_type: UserType;
}
