import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Gender, Relationship } from '../types/profile.types';

@Schema({ versionKey: false })
export class Dependant {
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
        unique: true,
      },
    }),
  )
  phone: string;

  @Prop(
    raw({
      height: { type: Number, required: false },
      weight: {
        type: Number,
        required: false,
      },
    }),
  )
  bmi: Record<number, number>;

  @Prop({
    required: true,
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  })
  email: string;

  @Prop({
    type: Date,
    required: true,
  })
  date_of_birth: Date;

  @Prop({
    required: true,
    type: String,
    enum: {
      values: [Gender.FEMALE, Gender.MALE],
      message: '{VALUE} is not supported',
    },
  })
  gender: Gender;

  @Prop({
    type: String,
  })
  address1: string;

  @Prop({
    type: String,
  })
  address2: string;

  @Prop({
    type: String,
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
      ],
      message: '{VALUE} is not supported',
    },
  })
  relationship: Relationship;

  @Prop({
    type: String,
  })
  state: string;

  @Prop({
    type: String,
  })
  country: string;

  @Prop({
    type: String,
  })
  zip_code: string;
}
export const DependantSchema = SchemaFactory.createForClass(Dependant);
