import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type File = {
  original_name: string;
  file_type: string;
  url: string;
};

export type ConditionDocument = HydratedDocument<Condition>;

@Schema({ versionKey: false, _id: false })
export class Condition {
  @Prop({ type: [String], required: true })
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

  @Prop(
    raw({
      file_type: { type: String },
      original_name: { type: String },
      url: { type: String },
    }),
  )
  file: File[];
}
export const ConditionsSchema = SchemaFactory.createForClass(Condition);
