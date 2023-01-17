import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import * as dotenv from 'dotenv';
import { TokensModule } from '../tokens/tokens.module';
import { MailService } from '../../core/emails/mail.service';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { GoogleAuth } from './strategies/googleAuth.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FileUploadHelper } from '../../common/helpers/file-upload.helpers';
import { UserSettingsModule } from '../user-settings/user-settings.module';

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
    UsersService,
    LocalStrategy,
    JwtStrategy,
    MailService,
    GeneralHelpers,
    GoogleAuth,
    GoogleStrategy,
    FileUploadHelper,
  ],
})
export class AuthModule {}
