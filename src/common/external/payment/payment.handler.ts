import { Injectable } from '@nestjs/common';
import { IPaymentInterface } from './payment.interface';
import { Paystack } from './providers/paystack';
import { TransferToRecipient, TokenizedCharge } from './payment.types';
import { AdminSettingsService } from '../../../modules/admin-settings/admin-settings.service';

@Injectable()
export class PaymentHandler implements IPaymentInterface {
  private currentProvider: string;
  constructor(
    private settingsService: AdminSettingsService,
    private readonly paystack: Paystack,
  ) {
    this.init().then((r) => (this.currentProvider = r));
  }

  async init() {
    const setting = await this.settingsService.findOne();
    return setting.defaults.payment_provider;
  }

  async getTransactions(
    page: number,
    reference?: string,
    start?: string,
    end?: string,
    status?: string,
  ) {
    return this.paystack.getTransactions(page, reference, start, end, status);
  }

  async resolveAccount(acct_number: string, bank_code: string) {
    return this.paystack.resolveAccount(acct_number, bank_code);
  }

  async tokenizedCharge({
    email,
    amount,
    reference,
    token,
    currency = 'NGN',
  }: TokenizedCharge) {
    return this.paystack.tokenizedCharge({
      email,
      amount,
      currency,
      reference,
      token,
    });
  }

  async transferToRecipient({
    recipient,
    amount,
    reference,
    reason,
    currency = 'NGN',
  }: TransferToRecipient) {
    return this.paystack.transferToRecipient({
      recipient,
      reference,
      currency,
      reason,
      amount,
    });
  }

  async verifyTransaction(id: string) {
    return this.paystack.verifyTransaction(id);
  }

  async verifyTransfer(id: string) {
    return this.paystack.verifyTransfer(id);
  }
}
