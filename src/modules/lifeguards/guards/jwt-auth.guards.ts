import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LifeguardsService } from '../lifeguards.service';
import { Messages } from '../../../core/messages/messages';

@Injectable()
export class LifeguardJwtAuthGuard extends AuthGuard('jwt-lg') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly lifeguardsService: LifeguardsService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(Messages.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = this.jwtService.decode(token);
    if (!decodedToken || !decodedToken.sub) {
      throw new UnauthorizedException(Messages.UNAUTHORIZED);
    }

    const lifeguard = await this.lifeguardsService.findOneById(
      decodedToken.sub,
    );
    if (!lifeguard) {
      throw new UnauthorizedException(Messages.UNAUTHORIZED);
    }
    request.user = decodedToken;
    return true;
  }
}
