import { Types } from 'mongoose';

export class JwtPayload {
  readonly sub: Types.ObjectId;
  readonly email: string;
  readonly first_name: string;
  readonly is_email_verified: boolean;
}
