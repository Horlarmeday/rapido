import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { LifeguardsService } from '../lifeguards.service';
import { Messages } from '../../../core/messages/messages';

@Injectable()
export class DoesUserExist implements CanActivate {
  constructor(private readonly lifeguardsService: LifeguardsService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request) {
    const userExist = await this.lifeguardsService.findOneByEmailOrPhone(
      request.body.email,
      request.body.phone,
    );
    if (userExist) {
      throw new ForbiddenException(Messages.USER_EXISTS);
    }
    return true;
  }
}
