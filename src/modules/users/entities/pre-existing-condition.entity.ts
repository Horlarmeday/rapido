import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class Condition {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({
    type: Date,
  })
  start_date: string;

  @Prop({
    type: Date,
  })
  end_date: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  is_condition_exists: boolean | string;

  @Prop({ type: String, required: false })
  file?: string;
}
export const ConditionsSchema = SchemaFactory.createForClass(Condition);
