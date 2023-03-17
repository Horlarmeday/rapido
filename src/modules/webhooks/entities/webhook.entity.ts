import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type WebhookDocument = HydratedDocument<Webhook>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Webhook {
  @Prop({ type: String, required: true })
  event: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  data: any;
}
export const WebhookSchema = SchemaFactory.createForClass(Webhook);
