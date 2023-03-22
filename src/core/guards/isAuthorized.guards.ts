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
export class IsAuthorized implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request) {
    const user = await this.usersService.findOneByEmailAndUserType(
      request.body.email,
      request.body.user_type,
    );
    if (!user)
      throw new BadRequestException(Messages.APPROPRIATE_FORM_AUTHENTICATION);
    return true;
  }
}
