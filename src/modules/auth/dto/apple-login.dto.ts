import { IsNotEmpty, IsOptional } from 'class-validator';
import {
  AppleAuthorization,
  AppleUser,
} from '../strategies/appleAuth.strategy';
import { Type } from 'class-transformer';

export class AppleLoginDto {
  @IsNotEmpty()
  @Type(() => AppleAuthorization)
  readonly authorization: AppleAuthorization;

  @IsOptional()
  @Type(() => AppleUser)
  readonly user?: AppleUser;
}
