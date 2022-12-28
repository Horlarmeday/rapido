import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Token, TokenDocument, TokenType } from './entities/token.entity';
import { Messages } from '../../core/messages/messages';
import { UsersService } from '../users/users.service';
import * as crypto from 'crypto';
import { GeneralHelpers } from '../../common/helpers/general.helpers';

@Injectable()
export class TokensService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    private usersService: UsersService,
    private generalHelpers: GeneralHelpers,
  ) {}

  async create(
    tokenType: TokenType,
    userId: Types.ObjectId,
  ): Promise<TokenDocument> {
    const token = this.createToken(tokenType, userId);
    return await this.tokenModel.create(token);
  }

  async verifyEmailToken(userId, token) {
    const foundToken = await this.findEmailTokenByUserId(userId, token);
    if (!foundToken) throw new BadRequestException(Messages.INVALID_TOKEN);

    // update user to verified
    await this.usersService.updateOne(userId, {
      is_email_verified: true,
      email_verified_at: Date.now(),
    });

    // delete the token
    await this.removeEmailVerification(foundToken._id);
    return true;
  }

  async verifyPhoneToken(userId, token) {
    const foundToken = await this.findEmailTokenByUserId(userId, token);
    if (!foundToken) throw new BadRequestException(Messages.INVALID_TOKEN);

    // update user to verified
    await this.usersService.updateOne(userId, {
      is_phone_verified: true,
      phone_verified_at: Date.now(),
    });

    // delete the token
    await this.removePhoneVerification(foundToken._id);
    return true;
  }

  async removePhoneVerification(tokenId: Types.ObjectId) {
    return this.tokenModel.deleteOne({ _id: tokenId });
  }

  async findEmailTokenByUserId(userId: string, token: string) {
    return this.tokenModel.findOne({ userId, token, type: TokenType.EMAIL });
  }

  async removeEmailVerification(tokenId: Types.ObjectId) {
    return this.tokenModel.deleteOne({ _id: tokenId });
  }

  private createToken(type: TokenType, userId: Types.ObjectId) {
    switch (type) {
      case TokenType.EMAIL:
        return {
          userId,
          token: crypto.randomBytes(32).toString('hex'),
          type,
        };
      case TokenType.PHONE:
        return {
          userId,
          token: this.generalHelpers.generateRandomNumbers(6),
          type,
        };
      case TokenType.FORGOT_PASSWORD:
        return {
          userId,
          token: crypto.randomBytes(32).toString('hex'),
          type,
        };
    }
  }
}
