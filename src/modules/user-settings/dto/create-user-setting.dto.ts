import { UserSettingsDefaults } from '../types/user-settings.types';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserSettingDto {
  @ValidateNested({ each: true })
  @Type(() => UserSettingsDefaults)
  defaults: UserSettingsDefaults;
}
