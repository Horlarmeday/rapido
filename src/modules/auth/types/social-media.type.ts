import { RegMedium, UserType } from '../../users/entities/user.entity';

export type SocialMediaUserType = {
  email: string;
  first_name: string;
  last_name: string;
  reg_medium: RegMedium;
  is_email_verified?: boolean;
  email_verified_at?: Date;
  user_type: UserType;
};
