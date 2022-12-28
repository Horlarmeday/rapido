import { RegMedium } from "../../users/entities/user.entity";

export type SocialMediaUserType = {
  email: string;
  first_name: string;
  last_name: string;
  reg_medium: RegMedium;
};
