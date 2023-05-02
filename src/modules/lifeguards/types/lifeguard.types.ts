import { RegMedium } from '../../users/entities/user.entity';
import { Types } from 'mongoose';

export class LifeguardPreferences {
  age_range: string;
  gender: string;
  location: string;
  treatment_class: string;
  donation_type: string;
  amount_donated: string;
}

export class CardDetails {
  _id?: Types.ObjectId;
  auth_code: string;
  last4Digit: string;
  expiry: Date;
  issuer: string;
  card_type: string;
  agent: string;
  currency: string;
  is_default: boolean;
}

export class SocialMediaCreate {
  reg_medium?: RegMedium;
  is_email_verified?: boolean;
  email_verified_at?: Date;
  email: any;
  first_name?: string;
  last_name?: string;
  profile_photo?: string | undefined;
}
