export type CreateTransferRecipient = {
  type?: string;
  name: string;
  account_number: string;
  currency?: 'NGN';
  bank_name: string;
};

export type TransferRecipient = {
  account_name: string;
  account_number: string;
  bank_name: string;
};

export type TransferToRecipient = {
  recipient: TransferRecipient;
  amount: string;
  reference: string;
  reason: string;
  currency: string;
};

export type TokenizedCharge = {
  email: string;
  amount: string;
  reference: string;
  token: string;
  currency: string;
};
