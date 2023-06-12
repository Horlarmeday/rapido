import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Item } from '../types/proforma.types';

export type ProformaInvoiceDocument = HydratedDocument<ProformaInvoice>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class ProformaInvoice {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true })
  prepared_by: string;

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
        drug_name: { type: String, required: true },
        unit_price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ]),
  )
  items: Item[];

  @Prop({ type: Number, required: true })
  sub_total: number;

  @Prop({ type: Number, required: true })
  delivery_fee: number;

  @Prop({ type: Number, required: true })
  total_price: number;

  @Prop({ type: Date, required: true })
  due_date: Date;

  @Prop({ type: Boolean, default: false })
  has_paid: boolean;
}
export const ProformaInvoiceSchema =
  SchemaFactory.createForClass(ProformaInvoice);
