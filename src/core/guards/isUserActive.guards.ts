import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from '../../modules/users/users.service';
import { Messages } from '../messages/messages';
import { ProfileStatus } from '../../modules/users/entities/user.entity';

@Injectable()
export class IsUserActive implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request) {
    const user = await this.usersService.findOneByEmail(request.body.email);
    if (user && user?.status !== ProfileStatus.ACTIVE)
      throw new BadRequestException(Messages.UNAUTHORIZED);
    return true;
  }
}
