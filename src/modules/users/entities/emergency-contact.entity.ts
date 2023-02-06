import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Phone, Relationship } from '../types/profile.types';

@Schema({ versionKey: false, _id: false })
export class EmergencyContact {
  @Prop({ type: String, required: true })
  first_name: string;

  @Prop({ type: String, required: true })
  last_name: string;

  @Prop(
    raw({
      country_code: { type: String, required: false },
      number: {
        type: String,
        required: false,
        minLength: 10,
        maxLength: 10,
      },
    }),
  )
  phone: Phone;

  @Prop({
    type: String,
    required: false,
  })
  address1: string;

  @Prop({
    type: String,
  })
  address2?: string;

  @Prop({
    type: String,
    required: false,
  })
  zip_code: string;

  @Prop({
    type: String,
    required: false,
    enum: {
      values: [
        Relationship.AUNTY,
        Relationship.BROTHER,
        Relationship.FATHER,
        Relationship.HUSBAND,
        Relationship.MOTHER,
        Relationship.SISTER,
        Relationship.WIFE,
        Relationship.UNCLE,
        Relationship.SON,
        Relationship.DAUGHTER,
        Relationship.FRIEND,
      ],
      message: '{VALUE} is not supported',
    },
  })
  relationship: Relationship;
}
export const EmergencyContactSchema =
  SchemaFactory.createForClass(EmergencyContact);
