import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Gender, MaritalStatus, Profile } from '../types/profile.types';
import { Condition, ConditionsSchema } from './pre-existing-condition.entity';
import {
  EmergencyContact,
  EmergencyContactSchema,
} from './emergency-contact.entity';
import { Dependant, DependantSchema } from './dependant.entity';
import * as moment from 'moment';

export type UserDocument = HydratedDocument<User>;

export enum UserType {
  PATIENT = 'Patient',
  SPECIALIST = 'Specialist',
}

export enum RegMedium {
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
  LOCAL = 'LOCAL',
}

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { getters: true },
})
export class User {
  @Prop(
    raw({
      first_name: { type: String, required: true, minLength: 3, trim: true },
      last_name: { type: String, required: true, minLength: 3, trim: true },
      gender: {
        required: false,
        type: String,
        enum: {
          values: [Gender.FEMALE, Gender.MALE],
          message: '{VALUE} is not supported',
        },
      },
      date_of_birth: {
        required: false,
        type: Date,
        get: (v) => moment(v).format('YYYY-MM-DD'),
      },
      password: {
        required: false,
        type: String,
        // validate: {
        //   validator: function (v) {
        //     return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(
        //       v,
        //     );
        //   },
        //   message: (props) => `${props.value} does not meet password criteria!`,
        // },
      },
      marital_status: {
        type: String,
        enum: {
          values: [
            MaritalStatus.DIVORCED,
            MaritalStatus.SINGLE,
            MaritalStatus.MARRIED,
            MaritalStatus.WIDOW,
            MaritalStatus.WIDOWER,
          ],
        },
      },
      contact: {
        email: {
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
        },
        phone: {
          country_code: { type: String, required: false },
          number: {
            type: String,
            required: false,
            minLength: 10,
            maxLength: 10,
            unique: true,
          },
        },
        address1: { type: String },
        address2: { type: String },
        state: { type: String },
        country: { type: String },
        zip_code: { type: String },
      },
      basic_health_info: {
        height: {
          value: { type: Number },
          unit: { type: String },
        },
        weight: {
          value: { type: Number },
          unit: { type: String },
        },
      },
      health_risk_factors: {
        is_smoker: { type: String },
        weight_status: { type: String },
        has_recent_injuries: { type: String },
      },
      twoFA_secret: { type: String, required: false },
      profile_photo: { type: String, required: false },
    }),
  )
  profile: Profile;

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

  @Prop({ type: Boolean, default: false })
  is_email_verified: boolean;

  @Prop({ type: Date })
  email_verified_at: Date;

  @Prop({ type: Boolean, default: false })
  is_phone_verified: boolean;

  @Prop({ type: Date })
  phone_verified_at: Date;

  @Prop({
    required: true,
    type: String,
    default: RegMedium.LOCAL,
    enum: {
      values: [RegMedium.APPLE, RegMedium.GOOGLE, RegMedium.LOCAL],
      message: '{VALUE} is not supported',
    },
  })
  reg_medium: RegMedium;

  @Prop([{ type: EmergencyContactSchema, required: false }])
  emergency_contacts?: EmergencyContact[];

  @Prop([{ type: ConditionsSchema, required: false }])
  pre_existing_conditions?: Condition[];

  @Prop([{ type: DependantSchema, required: false }])
  dependants?: Dependant[];
}
export const UserSchema = SchemaFactory.createForClass(User);
