import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type VitalDocument = HydratedDocument<Vital>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Vital {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop(
    raw([
      {
        _id: false,
        value: { type: String, required: true },
        unit: { type: String, required: true },
        updatedAt: { type: Date, default: new Date() },
      },
    ]),
  )
  body_temp: Record<string, string>;

  @Prop(
    raw([
      {
        _id: false,
        value: { type: String, required: true },
        unit: { type: String, required: true },
        updatedAt: { type: Date, default: new Date() },
      },
    ]),
  )
  body_weight: Record<string, string>;

  @Prop(
    raw([
      {
        _id: false,
        value: { type: String, required: true },
        unit: { type: String, required: true },
        updatedAt: { type: Date, default: new Date() },
      },
    ]),
  )
  blood_pressure: Record<string, string>;

  @Prop(
    raw([
      {
        _id: false,
        value: { type: String, required: true },
        unit: { type: String, required: true },
        updatedAt: { type: Date, default: new Date() },
      },
    ]),
  )
  blood_sugar_level: Record<string, string>;

  @Prop(
    raw([
      {
        _id: false,
        value: { type: String, required: true },
        unit: { type: String, required: true },
        updatedAt: { type: Date, default: new Date() },
      },
    ]),
  )
  pulse_rate: Record<string, string>;
}
export const VitalSchema = SchemaFactory.createForClass(Vital);
