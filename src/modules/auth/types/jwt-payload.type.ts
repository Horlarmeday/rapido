import { UserType } from '../../users/entities/user.entity';
import { Types } from 'mongoose';

export class IJwtPayload {
  readonly sub: Types.ObjectId;
  readonly email: string;
  readonly is_email_verified: boolean;
  readonly is_phone_verified: boolean;
  readonly user_type: UserType;
}
