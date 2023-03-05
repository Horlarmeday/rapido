import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Messages } from '../messages/messages';
import { CardsService } from '../../modules/cards/cards.service';

@Injectable()
export class DoesUserHaveCard implements CanActivate {
  constructor(private readonly cardService: CardsService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request) {
    const cards = await this.cardService.getUserCards(request.user.sub);
    if (!cards?.length) {
      throw new ForbiddenException(Messages.NO_CARD_SAVED);
    }
    return true;
  }
}
