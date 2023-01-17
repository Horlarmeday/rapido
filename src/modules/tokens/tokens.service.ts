import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Token, TokenDocument, TokenType } from './entities/token.entity';
import { Messages } from '../../core/messages/messages';
import { UsersService } from '../users/users.service';
import * as crypto from 'crypto';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import * as moment from 'moment';
import { create, deleteOne, findOne } from '../../common/crud/crud';

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
    return await create(this.tokenModel, token);
  }

  async verifyEmailToken(userId: Types.ObjectId, token: string) {
    const foundToken = await this.findTokenByUserIdAndType(
      userId,
      token,
      TokenType.EMAIL,
    );
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

  async verifyPhoneToken(userId: Types.ObjectId, token: string) {
    const userToken = await this.findTokenByUserIdAndType(
      userId,
      token,
      TokenType.PHONE,
    );
    if (!userToken) throw new BadRequestException(Messages.INVALID_TOKEN);

    if (moment(userToken.expires_in).isSameOrBefore(moment())) {
      // update user to verified
      await this.usersService.updateOne(userId, {
        is_phone_verified: true,
        phone_verified_at: Date.now(),
      });

      // delete the token
      await this.removeToken(userToken._id);
      return true;
    }
    //delete expired code
    await this.removeToken(userToken._id);
    throw new BadRequestException(Messages.INVALID_EXPIRED_TOKEN);
  }

  async verifyOTP(userId: Types.ObjectId, token: string) {
    const userToken = await this.findTokenByUserIdAndType(
      userId,
      token,
      TokenType.OTP,
    );
    if (!userToken) throw new BadRequestException(Messages.INVALID_TOKEN);

    if (moment(userToken.expires_in).isSameOrBefore(moment())) {
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
    return findOne(this.tokenModel, { userId, token, type: tokenType });
  }

  async findTokenByUserId(userId: Types.ObjectId, tokenType: TokenType) {
    return findOne(this.tokenModel, { userId, type: tokenType });
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
          token: this.generalHelpers.generateRandomNumbers(4),
          type,
          expires_in: moment().add(this.EXPIRY_HOURS, 'hour').toDate(),
        };
      case TokenType.OTP:
        return {
          userId,
          token: this.generalHelpers.generateRandomNumbers(4),
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
