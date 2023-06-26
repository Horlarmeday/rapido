import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Documents } from '../../users/types/profile.types';
import { PrescriptionType } from './prescription.entity';

export type PrescriptionFileDocument = HydratedDocument<PrescriptionFile>;

@Schema({
  collection: 'prescription_files',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class PrescriptionFile {
  @Prop({ type: String, required: true })
  specialist: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  patient: Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop(
    raw([
      {
        type_of_document: { type: String },
        url: { type: String },
        file_type: { type: String },
        original_name: { type: String },
      },
    ]),
  )
  documents: Documents[];

  @Prop({
    type: String,
    enum: { values: [PrescriptionType.EXTERNAL, PrescriptionType.INTERNAL] },
    default: PrescriptionType.EXTERNAL,
  })
  type: PrescriptionType;

  @Prop({ type: Boolean, default: false })
  is_sent_to_pharmacy: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy' })
  pharmacy: any;
}
export const PrescriptionFileSchema =
  SchemaFactory.createForClass(PrescriptionFile);
