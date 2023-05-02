import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Card, CardDocument } from './entities/card.entity';
import { Model, Types } from 'mongoose';
import { CardDetailsType } from '../../common/external/payment/providers/paystack';
import { PaymentProvider } from '../admin-settings/types/admin-settings.types';
import {
  create,
  deleteOne,
  find,
  findOne,
  updateOne,
} from '../../common/crud/crud';
import { MakeCardDefaultDto } from './dto/make-card-default.dto';
import { PaymentFor, Status } from '../payments/entities/payment.entity';
import { FAILED, PENDING, SUCCESS } from '../../core/constants';
import { PaymentHandler } from '../../common/external/payment/payment.handler';
import { UsersService } from '../users/users.service';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { PaymentsService } from '../payments/payments.service';
import { Messages } from '../../core/messages/messages';

@Injectable()
export class CardsService {
  private logger = new Logger(CardsService.name);
  constructor(
    @InjectModel(Card.name) private cardModel: Model<CardDocument>,
    private readonly paymentHandler: PaymentHandler,
    private readonly usersService: UsersService,
    private readonly generalHelpers: GeneralHelpers,
    private readonly paymentService: PaymentsService,
  ) {}
  async saveCardDetails(cardDetails: CardDetailsType, userId: Types.ObjectId) {
    const card = this.generalHelpers.formatCardDetails(
      cardDetails,
      PaymentProvider.PAYSTACK,
    );
    const existingCard = await this.findExistingCard(
      userId,
      cardDetails.last4,
      cardDetails.card_type,
    );
    if (!existingCard) {
      this.logger.log(`User ${userId} card details was saved successfully`);
      return await create(this.cardModel, { ...card, userId });
    }
    this.logger.log(`Card already exists, returning ${userId} card details`);
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
    return await find(
      this.cardModel,
      { userId },
      { selectFields: '-auth_code' },
    );
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

  async initializeTransaction(userId: Types.ObjectId) {
    const reference = this.generalHelpers.genTxReference();
    const amount = 100;
    const data = {
      amount: 100 * 100, // sending in kobo
      reference,
    };
    await this.paymentService.create(
      userId,
      reference,
      amount,
      PaymentFor.ADD_CARD,
    );
    return data;
  }

  async verifyCard(reference: string) {
    const response = await this.paymentHandler.verifyTransaction(reference);
    const payment = await this.paymentService.findPaymentByReference(reference);
    try {
      switch (response?.data?.status) {
        case SUCCESS:
          await Promise.all([
            this.paymentService.updatePayment(reference, {
              status: Status.SUCCESSFUL,
            }),
            response.data?.authorization?.reusable
              ? this.saveCardDetails(
                  response.data.authorization,
                  payment.userId,
                )
              : [],
          ]);
          return response;
        case FAILED:
          await Promise.all([
            this.paymentService.updatePayment(reference, {
              status: Status.FAILED,
            }),
          ]);
          return response;
        case PENDING:
          return response;
        default:
          return response;
      }
    } catch (e) {
      this.logger.error('An error occurred verifying card add', e);
      throw new InternalServerErrorException(e, 'An error occurred');
    }
  }

  async getCard(cardId: Types.ObjectId): Promise<CardDocument> {
    const card = await findOne(this.cardModel, { _id: cardId });
    if (!card) throw new NotFoundException(Messages.CARD_NOT_FOUND);
    return card;
  }
}
