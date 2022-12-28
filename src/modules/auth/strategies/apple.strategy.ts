import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from '@arendajaelu/nestjs-passport-apple';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('APPLE_CLIENT_ID'),
      teamID: config.get<string>('APPLE_TEAM_ID'),
      keyID: config.get<string>('APPLE_KEY_ID'),
      keyFilePath: config.get<string>('APPLE_KEYFILE_PATH'),
      callbackURL: config.get<string>('APPLE_CALLBACK'),
      passReqToCallback: false,
      scope: ['email', 'name'],
    });
  }
}
