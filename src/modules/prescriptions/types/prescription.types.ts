import { Types } from 'mongoose';

export class Dose {
  quantity: number;
  dosage_form: string;
}

export class Interval {
  time: string;
  unit: string;
}

export class Period {
  number: number;
  unit: string;
}

export class Refill {
  dose: Dose;
  interval: Interval;
}

export class Item {
  drug: Types.ObjectId;
  dose: Dose;
  interval: Interval;
  period: Period;
  require_refill: boolean;
  notes: string;
  refill_info: {
    dose: Dose;
    interval: Interval;
  };
}

export class Dosage {
  dose: Dose;
  interval: Interval;
  period: Period;
}
