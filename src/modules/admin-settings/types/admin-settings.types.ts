export enum PaymentProvider {
  PAYSTACK = 'Paystack',
  FLUTTERWAVE = 'Flutterwave',
  STRIPE = 'Stripe',
}

export class Rate {
  number: number;
  unit: string;
}

export class SpecialistRate {
  category: string;
  specialization: string;
  rate: Rate;
}

export class AdminDefaultSettingsTypes {
  payment_provider: PaymentProvider;
  specialist_rates: SpecialistRate[];
}
