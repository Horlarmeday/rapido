import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/entities/user.entity';
import { IJwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return AuthService.excludeFields(user);
  }

  private static excludeFields(user: UserDocument) {
    const serializedUser = user.toJSON() as Partial<User>;
    delete serializedUser.password;
    return serializedUser;
  }

  private static formatJwtPayload(user: User & UserDocument): IJwtPayload {
    return {
      sub: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      user_type: user.user_type,
    };
  }

  private static async comparePassword(
    enteredPassword: string,
    dbPassword: string,
  ) {
    return bcrypt.compare(enteredPassword, dbPassword);
  }
}
