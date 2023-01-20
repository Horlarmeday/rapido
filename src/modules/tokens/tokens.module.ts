import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from './entities/token.entity';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { MailService } from '../../core/emails/mail.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
  ],
  controllers: [],
  providers: [TokensService, GeneralHelpers, MailService],
  exports: [TokensService],
})
export class TokensModule {}
