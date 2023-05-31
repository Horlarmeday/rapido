import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet, WalletDocument } from './entities/wallet.entity';
import { Model, Types } from 'mongoose';
import { create, find, findOne, updateOne } from 'src/common/crud/crud';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { Messages } from '../../core/messages/messages';
import { WithdrawFundDto } from './dto/withdraw-wallet-fund.dto';
import {
  TransactionType,
  WalletTransaction,
  WalletTransactionDocument,
} from './entities/wallet-transactions.entity';
import currency = require('currency.js');
import { PaymentHandler } from '../../common/external/payment/payment.handler';
import { BanksService } from '../banks/banks.service';
import { SUCCESS } from '../../core/constants';
import * as moment from 'moment/moment';

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(WalletTransaction.name)
    private walletTxnModel: Model<WalletTransactionDocument>,
    private readonly generalHelpers: GeneralHelpers,
    private readonly paymentHandler: PaymentHandler,
    private readonly bankService: BanksService,
  ) {}
  async create(userId: Types.ObjectId) {
    return create(this.walletModel, { userId });
  }

  async getWalletTransactions(userId: Types.ObjectId) {
    return (await find(this.walletTxnModel, {
      userId,
    })) as WalletDocument[];
  }

  reduce(arr) {
    return arr.reduce((prevVal, currVal) => prevVal + currVal?.amount, 0);
  }

  async getUserEarnings(userId: Types.ObjectId) {
    const [earnings, withdrawals] = await Promise.all([
      find(this.walletTxnModel, {
        type: TransactionType.CREDIT,
        userId,
      }),
      find(this.walletTxnModel, {
        type: TransactionType.DEBIT,
        userId,
      }),
    ]);
    return {
      totalEarnings: this.reduce(earnings),
      totalWithdrawals: this.reduce(withdrawals),
    };
  }

  async getUserWallet(userId: Types.ObjectId): Promise<WalletDocument> {
    const wallet = await findOne(this.walletModel, { userId });
    if (!wallet) throw new NotFoundException(Messages.NOT_FOUND);
    return wallet;
  }

  async withdrawFromWallet(
    withdrawFundDto: WithdrawFundDto,
    userId: Types.ObjectId,
  ) {
    const { amount, bankId } = withdrawFundDto;
    const wallet = await this.getUserWallet(userId);
    const bank = await this.bankService.getBank(bankId);
    const reference = this.generalHelpers.genTxReference();
    const narration = 'Fund Removal';

    if (+amount > +wallet.available_balance)
      throw new BadRequestException(Messages.WALLET_BALANCE_LOW);

    const response = await this.paymentHandler.transferToRecipient({
      recipient: bank,
      amount,
      reference,
      reason: narration,
    });

    if (response?.status === SUCCESS) {
      await create(this.walletTxnModel, {
        amount,
        type: TransactionType.DEBIT,
        walletId: wallet._id,
        userId,
        narration,
        reference,
        bankId,
      });
      await updateOne(
        this.walletModel,
        { _id: wallet._id },
        {
          available_balance: currency(wallet.available_balance).subtract(
            amount,
          ),
          ledger_balance: currency(wallet.available_balance).subtract(amount),
        },
      );
    }
    throw new InternalServerErrorException();
  }

  async totalEarningsData(userId: Types.ObjectId) {
    const [totalEarnings, earningsThisWeek] = await Promise.all([
      find(this.walletTxnModel, {
        type: TransactionType.CREDIT,
        userId,
      }),
      find(this.walletTxnModel, {
        type: TransactionType.CREDIT,
        userId,
        created_at: {
          $gte: moment().startOf('week').toDate(),
          $lt: moment().endOf('week').toDate(),
        },
      }),
    ]);
    return {
      totalEarnings: this.reduce(totalEarnings),
      earningsThisWeek: this.reduce(earningsThisWeek),
    };
  }
}
