import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AdminDefaultSettingsTypes } from '../types/admin-settings.types';

export class CreateAdminSettingDto {
  @ValidateNested({ each: true })
  @Type(() => AdminDefaultSettingsTypes)
  defaults: AdminDefaultSettingsTypes;
}
