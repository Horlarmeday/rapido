import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from './entities/token.entity';
import { UsersService } from '../users/users.service';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { TokensController } from './tokens.controller';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from "@nestjs/jwt";
import { MailService } from "../../core/emails/mail.service";

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
  ],
  controllers: [TokensController],
  providers: [TokensService, UsersService, GeneralHelpers, MailService],
  exports: [TokensService],
})
export class TokensModule {}
