import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from '../../modules/users/users.service';
import { Messages } from '../messages/messages';

@Injectable()
export class IsEmailVerified implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request) {
    const user = await this.usersService.findOneByEmail(request.body.email);
    if (user && user?.is_email_verified) return true;
    throw new BadRequestException(Messages.EMAIL_NOT_VERIFIED);
  }
}
