import { UserType } from '../../users/entities/user.entity';
import { Types } from "mongoose";

export class IJwtPayload {
  readonly first_name: string;
  readonly last_name: string;
  readonly sub: Types.ObjectId;
  readonly email: string;
  readonly user_type: UserType;
}
