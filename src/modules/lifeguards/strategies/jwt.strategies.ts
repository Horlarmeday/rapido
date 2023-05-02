import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Messages } from '../../../core/messages/messages';
import { LifeguardsService } from '../lifeguards.service';
import { JwtPayload } from '../types/jwt-payload.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly lifeguardsService: LifeguardsService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWTKEY,
    });
  }

  async validate(payload: JwtPayload) {
    const lifeguard = await this.lifeguardsService.findOneById(payload.sub);
    if (!lifeguard) {
      throw new UnauthorizedException(Messages.UNAUTHORIZED);
    }
    return payload;
  }
}
