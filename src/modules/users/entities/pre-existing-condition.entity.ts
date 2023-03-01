import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';

export type File = {
  original_name: string;
  size: string;
  url: string;
};

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
      size: { type: String },
      original_name: { type: String },
      url: { type: String },
    }),
  )
  file: File;
}
export const ConditionsSchema = SchemaFactory.createForClass(Condition);
