import { Prop, raw, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum UserType {
  PATIENT = 'Patient',
  SPECIALIST = 'Specialist',
}

@Schema()
export class User {
  @Prop({ required: true, minlength: 3, type: String, trim: true })
  first_name: string;

  @Prop({ required: true, minlength: 3, type: String, trim: true })
  last_name: string;

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
    required: true,
    type: String,
    enum: {
      values: [Gender.FEMALE, Gender.MALE],
      message: '{VALUE} is not supported',
    },
  })
  gender: Gender;

  @Prop(
    raw({
      country_code: { type: String, required: true },
      number: {
        type: String,
        required: true,
        minLength: 10,
        maxLength: 10,
        unique: true,
      },
    }),
  )
  phone: string;

  @Prop({ required: true, type: Date })
  date_of_birth: Date;

  @Prop({
    required: true,
    type: String,
    validate: {
      validator: function (v) {
        return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(
          v,
        );
      },
      message: (props) => `${props.value} does not meet password criteria!`,
    },
  })
  password: string;

  @Prop({
    required: true,
    type: String,
    default: UserType.PATIENT,
    enum: {
      values: [UserType.PATIENT, UserType.SPECIALIST],
      message: '{VALUE} is not supported',
    },
  })
  user_type: UserType;

  @Prop({ type: Boolean, default: false })
  terms: boolean;

  @Prop({ type: Boolean, default: false })
  marketing: boolean;
}
export const UserSchema = SchemaFactory.createForClass(User);
