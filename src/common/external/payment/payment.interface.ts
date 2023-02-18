import { TokenizedCharge, TransferToRecipient } from './payment.types';

export interface IPaymentInterface {
  /**
   * verify a transaction
   * @return mixed
   * @param id
   */
  verifyTransaction(id: string);

  /**
   * Charge a card with its token
   * @return mixed
   */
  tokenizedCharge({
    email,
    amount,
    reference,
    token,
    currency,
  }: TokenizedCharge);

  /**
   * Get all transactions for a particular time
   * @param reference
   * @param start
   * @param end
   * @param status
   * @param page
   * @return mixed
   */
  getTransactions(
    page: number,
    reference?: string,
    start?: string,
    end?: string,
    status?: string,
  );

  /**
   * Charge a card with its token
   * @param recipient
   * @param amount
   * @param reference
   * @param reason
   * @param currency
   * @return mixed
   */
  transferToRecipient({
    recipient,
    amount,
    reference,
    reason,
    currency,
  }: TransferToRecipient);

  /**
   * verify a transfer
   * @return mixed
   * @param id
   */
  verifyTransfer(id: string);

  /**
   * verify a transfer
   * @return mixed
   * @param acct_number
   * @param bank_code
   */
  resolveAccount(acct_number: string, bank_code: string);

  /**
   * initialize a transaction
   * @return mixed
   * @param email
   * @param amount
   * @param reference
   * @param metadata
   */
  initializeTransaction(
    email: string,
    amount: number,
    reference: string,
    metadata?: any,
  );
}
