export enum WebhookEventTypes {
  TRANSACTION_SUCCESS = 'charge.success',
  TRANSFER_SUCCESS = 'transfer.success',
  TRANSFER_FAILED = 'transfer.failed',
  TRANSFER_REVERSED = 'transfer.reversed',
}

export interface History {
  type: string;
  message: string;
  time: number;
}

export interface Log {
  time_spent: number;
  attempts: number;
  authentication: string;
  errors: number;
  success: boolean;
  mobile: boolean;
  input: any[];
  channel?: any;
  history: History[];
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  customer_code: string;
  phone?: any;
  metadata?: any;
  risk_action: string;
}

export interface Authorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  account_name: string;
}

export interface Data {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message?: any;
  gateway_response: string;
  paid_at: Date;
  created_at: Date;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: number;
  log: Log;
  fees?: any;
  customer: Customer;
  authorization: Authorization;
  plan: any;
}

export interface PaystackWebhookData {
  event: string;
  data: Data;
}
