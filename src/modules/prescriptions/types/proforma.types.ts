import { Types } from 'mongoose';

export class Item {
  drug_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export class Proforma {
  prepared_by: Types.ObjectId;
  patient: Types.ObjectId;
  prescription: Types.ObjectId;
  items: Item[];
  sub_total: number;
  delivery_fee: number;
  total_price: number;
  due_date: Date;
  has_paid: boolean;
}
