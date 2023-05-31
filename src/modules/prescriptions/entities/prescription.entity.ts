import { Prop, raw, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Dose, Interval, Period, Refill } from '../types/prescription.types';

export type PrescriptionDocument = HydratedDocument<Prescription>;

export class Prescription {
  @Prop({ type: String, required: true })
  drug_name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  prescribed_by: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  patient: string;

  @Prop(
    raw({
      quantity: { type: Number },
      dosage_form: { type: String },
    }),
  )
  dose: Dose;

  @Prop(
    raw({
      time: { type: String },
      unit: { type: String },
    }),
  )
  interval: Interval;

  @Prop(
    raw({
      number: { type: Number },
      unit: { type: String },
    }),
  )
  period: Period;

  @Prop({ type: Boolean, default: false })
  require_refill: boolean;

  @Prop({ type: Boolean, default: false })
  is_sent_to_patient: boolean;

  @Prop(
    raw({
      dose: raw({
        quantity: { type: Number },
        dosage_form: { type: String },
      }),
      interval: raw({
        time: { type: String },
        unit: { type: String },
      }),
    }),
  )
  refill_info: Refill;
}
export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);
