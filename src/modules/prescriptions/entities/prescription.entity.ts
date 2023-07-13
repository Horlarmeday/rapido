import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Item } from '../types/prescription.types';
import { Pharmacy } from './pharmacy.entity';

export type PrescriptionDocument = HydratedDocument<Prescription>;
export enum PrescriptionType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}
export enum ProgressStatus {
  PRESCRIPTION_RECEIVED = 'Prescription Received',
  PRESCRIPTION_VALIDATION_FAILED = 'Prescription validation failed',
  VALIDATING_PRESCRIPTION = 'Validating prescription',
  PROCESSING_ORDER = 'Processing order',
  ORDER_PROCESSED = 'Order processed',
}
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Prescription {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  prescribed_by: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  patient: string;

  @Prop({
    type: String,
    enum: {
      values: [
        ProgressStatus.PRESCRIPTION_RECEIVED,
        ProgressStatus.VALIDATING_PRESCRIPTION,
        ProgressStatus.PRESCRIPTION_VALIDATION_FAILED,
        ProgressStatus.ORDER_PROCESSED,
        ProgressStatus.PROCESSING_ORDER,
      ],
    },
  })
  progress_status: ProgressStatus;

  @Prop(
    raw([
      {
        drug: {
          type: String,
          required: true,
        },
        dose: {
          quantity: { type: Number },
          dosage_form: { type: String },
        },
        interval: {
          time: { type: String },
          unit: { type: String },
        },
        period: {
          number: { type: Number },
          unit: { type: String },
        },
        require_refill: { type: Boolean },
        notes: { type: String },
        refill_info: {
          dose: {
            quantity: { type: Number },
            dosage_form: { type: String },
          },
          interval: {
            time: { type: String },
            unit: { type: String },
          },
        },
      },
    ]),
  )
  items: Item[];

  @Prop({
    type: String,
    enum: { values: [PrescriptionType.EXTERNAL, PrescriptionType.INTERNAL] },
    default: PrescriptionType.INTERNAL,
  })
  type: PrescriptionType;

  @Prop({ type: Boolean, default: false })
  is_sent_to_patient: boolean;

  @Prop({ type: Boolean, default: false })
  is_sent_to_pharmacy: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy' })
  pharmacy: Pharmacy;
}
const PrescriptionSchema = SchemaFactory.createForClass(Prescription);

PrescriptionSchema.pre('find', function (next) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (this?.options._recursed) {
    return next();
  }
  this.populate({
    path: 'prescribed_by patient',
    options: { _recursed: true },
    select: '-profile.password -profile.twoFA_secret -security',
  });
  next();
});

PrescriptionSchema.pre('findOne', function (next) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (this?.options._recursed) {
    return next();
  }
  this.populate({
    path: 'prescribed_by patient',
    options: { _recursed: true },
    select: '-profile.password -profile.twoFA_secret -security',
  });
  next();
});

export { PrescriptionSchema };
