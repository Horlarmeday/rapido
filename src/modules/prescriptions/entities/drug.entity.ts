import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DrugDocument = HydratedDocument<Drug>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Drug {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  price: string;
}
export const DrugSchema = SchemaFactory.createForClass(Drug);
