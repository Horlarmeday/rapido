import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Item } from '../types/proforma.types';

export type OrderDocument = HydratedDocument<Order>;

export enum PaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  FAILED = 'Failed',
}

export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  IN_TRANSIT = 'In Transit',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
}

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  patient: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    required: true,
  })
  prescription: Types.ObjectId;

  @Prop(
    raw([
      {
        drug_name: {
          type: String,
          required: true,
        },
        unit_price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        total: { type: Number, required: true },
        dosage_form: { type: String, required: true },
      },
    ]),
  )
  items: Item[];

  @Prop({ type: Number, required: true })
  sub_total: number;

  @Prop({ type: Number, default: 0 })
  delivery_fee: number;

  @Prop({ type: Number, default: 0 })
  total_price: number;

  @Prop({ type: Boolean, default: false })
  is_order_confirmed: boolean;

  @Prop({
    type: String,
    enum: {
      values: [
        OrderStatus.CANCELLED,
        OrderStatus.DELIVERED,
        OrderStatus.PENDING,
        OrderStatus.SHIPPED,
        OrderStatus.PROCESSING,
      ],
    },
    default: OrderStatus.PENDING,
  })
  order_status: OrderStatus;

  @Prop({
    type: String,
    enum: {
      values: [PaymentStatus.PAID, PaymentStatus.FAILED, PaymentStatus.PENDING],
    },
    default: PaymentStatus.PENDING,
  })
  payment_status: PaymentStatus;

  @Prop({ type: String })
  payment_method: string;

  @Prop(
    raw({
      address: { type: String },
      email: { type: String },
      phone: { type: String },
    }),
  )
  shipping_details: string;

  @Prop({ type: String })
  feedback: string;

  @Prop({ type: String, default: Date.now(), unique: true, required: true })
  order_number: string;
}
export const OrderSchema = SchemaFactory.createForClass(Order);
