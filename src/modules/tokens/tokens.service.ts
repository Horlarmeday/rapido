import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Token, TokenDocument, TokenType } from './entities/token.entity';
import { Messages } from '../../core/messages/messages';
import { UsersService } from '../users/users.service';
import * as crypto from 'crypto';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import * as moment from 'moment';

@Injectable()
export class TokensService {
  private EXPIRY_HOURS = 4;
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    private usersService: UsersService,
    private generalHelpers: GeneralHelpers,
  ) {}

  async create(
    tokenType: TokenType,
    userId: Types.ObjectId,
  ): Promise<TokenDocument> {
    const token = await this.createToken(tokenType, userId);
    return await this.tokenModel.create(token);
  }

  async verifyEmailToken(userId, token) {
    const foundToken = await this.findEmailTokenByUserId(userId, token);
    if (!foundToken) throw new BadRequestException(Messages.INVALID_TOKEN);

    if (moment(foundToken.expires_in).isSameOrBefore(moment())) {
      // update user to verified
      await this.usersService.updateOne(userId, {
        is_email_verified: true,
        email_verified_at: Date.now(),
      });

      // delete the token
      await this.removeToken(foundToken._id);
      return true;
    }
    //delete expired code
    await this.removeToken(foundToken._id);
    throw new BadRequestException(Messages.INVALID_EXPIRED_TOKEN);
  }

  async verifyPhoneToken(userId, token) {
    const foundToken = await this.findEmailTokenByUserId(userId, token);
    if (!foundToken) throw new BadRequestException(Messages.INVALID_TOKEN);

    if (moment(foundToken.expires_in).isSameOrBefore(moment())) {
      // update user to verified
      await this.usersService.updateOne(userId, {
        is_phone_verified: true,
        phone_verified_at: Date.now(),
      });

      // delete the token
      await this.removeToken(foundToken._id);
      return true;
    }
    //delete expired code
    await this.removeToken(foundToken._id);
    throw new BadRequestException(Messages.INVALID_EXPIRED_TOKEN);
  }

  async removeToken(tokenId: Types.ObjectId) {
    return this.tokenModel.deleteOne({ _id: tokenId });
  }

  async findToken(token: string) {
    return this.tokenModel.findOne({ token });
  }

  async findEmailTokenByUserId(userId: string, token: string) {
    return this.tokenModel.findOne({ userId, token, type: TokenType.EMAIL });
  }

  async findTokenByUserId(userId: Types.ObjectId, tokenType: TokenType) {
    return this.tokenModel.findOne({ userId, type: tokenType });
  }

  private createToken(type: TokenType, userId: Types.ObjectId) {
    switch (type) {
      case TokenType.EMAIL:
        return {
          userId,
          token: crypto.randomBytes(32).toString('hex'),
          type,
          expires_in: moment().add(this.EXPIRY_HOURS, 'hour').toDate(),
        };
      case TokenType.PHONE:
        return {
          userId,
          token: this.generalHelpers.generateRandomNumbers(6),
          type,
          expires_in: moment().add(this.EXPIRY_HOURS, 'hour').toDate(),
        };
      case TokenType.FORGOT_PASSWORD:
        return {
          userId,
          token: crypto.randomBytes(32).toString('hex'),
          type,
          expires_in: moment().add(this.EXPIRY_HOURS, 'hour').toDate(),
        };
    }
  }
}
