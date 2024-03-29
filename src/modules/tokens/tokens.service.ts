import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Token, TokenDocument, TokenType } from './entities/token.entity';
import { Messages } from '../../core/messages/messages';
import * as crypto from 'crypto';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import * as moment from 'moment';
import { create, deleteOne, findOne } from '../../common/crud/crud';

@Injectable()
export class TokensService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    private generalHelpers: GeneralHelpers,
  ) {}

  async create(
    tokenType: TokenType,
    userId: Types.ObjectId,
  ): Promise<TokenDocument> {
    const token = await this.createToken(tokenType, userId);
    return await create(this.tokenModel, token);
  }

  async verifyOTP(userId: Types.ObjectId, token: string) {
    const userToken = await this.findTokenByUserIdAndType(
      userId,
      token,
      TokenType.OTP,
    );
    if (!userToken) throw new BadRequestException(Messages.INVALID_TOKEN);

    if (moment(userToken.expires_in).isSameOrAfter(moment())) {
      // delete the token
      await this.removeToken(userToken._id);
      return true;
    }
    //delete expired code
    await this.removeToken(userToken._id);
    throw new BadRequestException(Messages.INVALID_EXPIRED_TOKEN);
  }

  async removeToken(tokenId: Types.ObjectId) {
    return deleteOne(this.tokenModel, { _id: tokenId });
  }

  async findToken(token: string) {
    return findOne(this.tokenModel, { token });
  }

  async findTokenByUserIdAndType(
    userId: Types.ObjectId,
    token: string,
    tokenType: TokenType,
  ) {
    return await findOne(this.tokenModel, { userId, token, type: tokenType });
  }

  async findTokenByUserId(userId: Types.ObjectId, tokenType: TokenType) {
    return findOne(this.tokenModel, { userId, type: tokenType });
  }

  private createToken(type: TokenType, userId: Types.ObjectId) {
    const EXPIRY_HOURS = 4;
    const TOKEN_LENGTH = 6;

    switch (type) {
      case TokenType.EMAIL:
        return {
          userId,
          token: crypto.randomBytes(32).toString('hex'),
          type,
          expires_in: moment().add(EXPIRY_HOURS, 'hour').toDate(),
        };
      case TokenType.PHONE:
        return {
          userId,
          token: this.generalHelpers.generateRandomNumbers(TOKEN_LENGTH),
          type,
          expires_in: moment().add(EXPIRY_HOURS, 'hour').toDate(),
        };
      case TokenType.OTP:
        return {
          userId,
          token: this.generalHelpers.generateRandomNumbers(TOKEN_LENGTH),
          type,
          expires_in: moment().add(EXPIRY_HOURS, 'hour').toDate(),
        };
      case TokenType.FORGOT_PASSWORD:
        return {
          userId,
          token: crypto.randomBytes(32).toString('hex'),
          type,
          expires_in: moment().add(EXPIRY_HOURS, 'hour').toDate(),
        };
    }
  }
}
