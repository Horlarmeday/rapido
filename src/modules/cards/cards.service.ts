import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Card, CardDocument } from './entities/card.entity';
import { Model, Types } from 'mongoose';
import { CardDetailsType } from '../../common/external/payment/providers/paystack';
import * as moment from 'moment';
import { PaymentProvider } from '../admin-settings/types/admin-settings.types';
import {
  create,
  deleteOne,
  find,
  findOne,
  updateOne,
} from '../../common/crud/crud';
import { MakeCardDefaultDto } from './dto/make-card-default.dto';

@Injectable()
export class CardsService {
  private logger = new Logger(CardsService.name);
  constructor(@InjectModel(Card.name) private cardModel: Model<CardDocument>) {}
  async saveCardDetails(cardDetails: CardDetailsType, userId: Types.ObjectId) {
    const card = {
      currency: 'NGN',
      auth_code: cardDetails?.authorization_code,
      card_type: cardDetails?.card_type,
      last4Digit: cardDetails?.last4,
      expiry: moment(
        `${cardDetails?.exp_year}-${cardDetails?.exp_month}-01`,
      ).toDate(),
      issuer: cardDetails?.bank,
      agent: PaymentProvider.PAYSTACK,
      userId,
    };
    const existingCard = await this.findExistingCard(
      userId,
      cardDetails.last4,
      cardDetails.card_type,
    );
    if (!existingCard) {
      this.logger.log(`User ${userId} card details was saved successfully`);
      return await create(this.cardModel, { ...card });
    }
    this.logger.log(`Returning ${userId} card details`);
    return existingCard;
  }

  async findExistingCard(
    userId: Types.ObjectId,
    last4Digit: string,
    card_type: string,
  ) {
    return await findOne(this.cardModel, { userId, last4Digit, card_type });
  }

  async getUserCards(userId: Types.ObjectId) {
    return await find(this.cardModel, { userId }, '-auth_code');
  }

  async removeCard(cardId: string) {
    return await deleteOne(this.cardModel, { _id: cardId });
  }

  async makeCardDefault(makeCardDefaultDto: MakeCardDefaultDto) {
    return await updateOne(
      this.cardModel,
      { _id: makeCardDefaultDto.cardId },
      {
        default: true,
      },
    );
  }
}
