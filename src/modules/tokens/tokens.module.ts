import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from './entities/token.entity';
import { UsersService } from '../users/users.service';
import { GeneralHelpers } from "../../common/helpers/general.helpers";

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
  ],
  providers: [TokensService, UsersService, GeneralHelpers],
  exports: [TokensService],
})
export class TokensModule {}
