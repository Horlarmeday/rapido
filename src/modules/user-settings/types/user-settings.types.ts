import { TwoFAMedium } from '../entities/user-setting.entity';

export class UserSettingsDefaults {
  twoFA_auth?: boolean;
  marketing?: boolean;
  receive_email_notifications?: boolean;
  twoFA_medium?: TwoFAMedium;
}
