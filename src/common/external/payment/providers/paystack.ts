import { IPaymentInterface } from '../payment.interface';
import { get, post } from '../../axios';
import {
  CreateTransferRecipient,
  TokenizedCharge,
  TransferToRecipient,
} from '../payment.types';
import { Logger } from '@nestjs/common';
import { Messages } from '../../../../core/messages/messages';
import { GeneralHelpers } from '../../../helpers/general.helpers';
// import { GeneralHelpers } from '../../../helpers/general.helpers';
export type CardDetailsType = {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
  account_name: string;
};

export class Paystack implements IPaymentInterface {
  private readonly baseUrl: string = 'https://api.paystack.co/';
  private readonly secretKey: string;
  private readonly publicKey: string;
  private readonly headers: { Authorization: string; 'Content-Type': string };
  private readonly verifyTransactionUrl = 'transaction/verify/';
  private readonly verifyTransferUrl = 'transfer/';
  private readonly createTransferRecipientUrl = 'transferrecipient';
  private readonly transferToRecipientUrl = 'transfer';
  private readonly getTransactionsUrl = 'transaction';
  private readonly chargeAuthorizationUrl = 'transaction/charge_authorization/';
  private readonly resolveAccountUrl = 'bank/resolve';
  private readonly initializeTransactionUrl = 'transaction/initialize';
  private logger = new Logger(Paystack.name);

  constructor() {
    this.secretKey = <string>process.env.PAYSTACK_SECRET_KEY;
    this.publicKey = <string>process.env.PAYSTACK_PUBLIC_KEY;
    this.headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.secretKey}`,
    };
  }

  async initializeTransaction(
    email: string,
    amount: number,
    reference: string,
    metadata?: any,
  ) {
    const url = `${this.baseUrl}${this.initializeTransactionUrl}`;
    const data = {
      email,
      amount: (+amount * 100).toString(),
      reference,
      metadata,
      channels: ['card'],
    };
    const response = await post(url, data, { headers: this.headers });
    this.logger.log(`Initializing transaction for ${email}`);
    return response;
  }

  getTransactions(
    page: number,
    reference?: string,
    start?: string,
    end?: string,
    status?: string,
  ) {
    const url = `${this.baseUrl}${this.getTransactionsUrl}`;
    const params = {
      page,
      from: start,
      to: end,
      status,
    };
    return get(url, this.headers, params);
  }

  async tokenizedCharge({ email, amount, reference, token }: TokenizedCharge) {
    const url = `${this.baseUrl}${this.chargeAuthorizationUrl}`;
    const data = {
      email,
      amount: (+amount * 100).toString(),
      reference,
      token,
    };
    const response = await post(url, data, { headers: this.headers });
    this.logger.log(`A card charge attempt made on ${email} account`);
    return response;
  }

  async createTransferRecipient({
    type = 'nuban',
    name,
    account_number,
    currency = 'NGN',
    bank_name,
  }: CreateTransferRecipient) {
    const url = `${this.baseUrl}${this.createTransferRecipientUrl}`;
    const data = {
      type,
      name,
      account_number,
      bank_code: GeneralHelpers.findBankCode(bank_name),
      currency,
    };
    const response = await post(url, data, { headers: this.headers });
    this.logger.log(
      `Recipient ${response.data.recipient_code} has been created`,
    );
    return response;
  }

  async transferToRecipient({
    recipient,
    amount,
    reference,
    reason,
    currency,
  }: TransferToRecipient) {
    const url = `${this.baseUrl}${this.transferToRecipientUrl}`;
    const beneficiary = await this.createTransferRecipient({
      currency: 'NGN',
      name: recipient.account_name,
      account_number: recipient.account_number,
      bank_name: recipient.bank_name,
    });
    if (beneficiary.data.recipient_code) {
      const data = {
        source: 'balance',
        reason,
        amount: (+amount * 100).toString(),
        currency,
        reference,
        recipient: beneficiary.data.recipient_code,
      };
      const response = await post(url, data, { headers: this.headers });
      this.logger.log(
        `Transfer to recipient ${response.data.recipient_code} initiated`,
      );
      return response;
    }
    this.logger.error(Messages.ERROR_OCCURRED_TRANSFER);
  }

  async verifyTransaction(reference: string) {
    const url = `${this.baseUrl}${this.verifyTransactionUrl}${reference}`;
    try {
      const { data } = await get(url, this.headers);
      return data;
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  async verifyTransfer(id: string) {
    const url = `${this.baseUrl}${this.verifyTransferUrl}${id}`;
    return await get(url, this.headers);
  }

  async resolveAccount(acct_number: string, bank_code: string) {
    const url = `${this.baseUrl}${this.resolveAccountUrl}`;
    const params = {
      account_number: acct_number,
      bank_code,
    };
    return await get(url, this.headers, params);
  }
}
