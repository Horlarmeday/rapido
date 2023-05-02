import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { LifeguardsService } from '../lifeguards.service';
import { Messages } from '../../../core/messages/messages';

@Injectable()
export class IsEmailVerified implements CanActivate {
  constructor(private readonly lifeguardsService: LifeguardsService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request) {
    const lifeguard = await this.lifeguardsService.findOneByEmail(
      request.body.email,
    );
    if (lifeguard && lifeguard?.is_email_verified) return true;
    throw new BadRequestException(Messages.EMAIL_NOT_VERIFIED);
  }
}
