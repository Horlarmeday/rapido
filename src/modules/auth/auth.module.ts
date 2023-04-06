import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import * as dotenv from 'dotenv';
import { TokensModule } from '../tokens/tokens.module';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { GoogleAuth } from './strategies/googleAuth.strategy';
import { UserSettingsModule } from '../user-settings/user-settings.module';
import { Twilio } from '../../common/external/twilio/twilio';
import { AppleAuth } from './strategies/appleAuth.strategy';

dotenv.config();

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWTKEY,
      signOptions: {
        expiresIn: process.env.TOKEN_EXPIRATION,
      },
    }),
    UsersModule,
    TokensModule,
    UserSettingsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GeneralHelpers,
    GoogleAuth,
    AppleAuth,
    Twilio,
  ],
})
export class AuthModule {}
