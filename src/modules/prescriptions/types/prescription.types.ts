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
