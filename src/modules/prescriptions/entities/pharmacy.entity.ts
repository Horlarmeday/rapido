import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PharmacyDocument = HydratedDocument<Pharmacy>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Pharmacy {
  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  address: string;
}
export const PharmacySchema = SchemaFactory.createForClass(Pharmacy);
