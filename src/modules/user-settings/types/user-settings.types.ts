import { TwoFAMedium } from '../entities/user-setting.entity';

export class UserSettingsDefaults {
  twoFA_auth?: boolean;
  twoFA_medium?: TwoFAMedium;
}
