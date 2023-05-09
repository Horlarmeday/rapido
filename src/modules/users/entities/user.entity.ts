import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  Award,
  Documents,
  Gender,
  MaritalStatus,
  PaymentStructure,
  ProfessionalPractice,
  Profile,
  Relationship,
  Security,
  SpecialistCategories,
} from '../types/profile.types';
import { Condition } from './pre-existing-condition.entity';
import { EmergencyContact } from './emergency-contact.entity';
import { Dependant } from './dependant.entity';
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

export enum ProfileStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  CANCELLED = 'Cancelled',
}

export enum VerificationStatus {
  VERIFIED = 'Verified',
  UNVERIFIED = 'Unverified',
  SUSPENDED = 'Suspended',
}

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { getters: true, virtuals: true },
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
          // validate: {
          //   validator: function (v) {
          //     return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
          //   },
          //   message: (props) => `${props.value} is not a valid email!`,
          // },
        },
        phone: {
          country_code: { type: String, required: false },
          number: {
            type: String,
            required: false,
            minLength: 10,
            maxLength: 10,
            unique: true,
            sparse: true,
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

  @Prop({ type: Boolean, default: false })
  is_auth_app_enabled: boolean;

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

  @Prop(
    raw([
      {
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        phone: {
          country_code: { type: String, required: false },
          number: {
            type: String,
            required: false,
            minLength: 10,
            maxLength: 10,
          },
        },
        address1: { type: String },
        address2: { type: String },
        relationship: {
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
              Relationship.SON,
              Relationship.DAUGHTER,
              Relationship.FRIEND,
            ],
            message: '{VALUE} is not supported',
          },
        },
        zip_code: { type: String },
        state: { type: String },
        country: { type: String },
      },
    ]),
  )
  emergency_contacts?: EmergencyContact[];

  @Prop(
    raw([
      {
        name: { type: String, required: true },
        description: { type: String, required: true },
        start_date: { type: Date, get: (v) => moment(v).format('YYYY-MM-DD') },
        end_date: { type: Date, get: (v) => moment(v).format('YYYY-MM-DD') },
        is_condition_exists: { type: Boolean, default: false },
        file: [
          {
            file_type: { type: String },
            original_name: { type: String },
            url: { type: String },
          },
        ],
      },
    ]),
  )
  pre_existing_conditions?: Condition[];

  @Prop(
    raw([
      {
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        contact: {
          phone: {
            country_code: { type: String, required: false },
            number: {
              type: String,
              required: false,
              minLength: 10,
              maxLength: 10,
            },
          },
          email: { type: String },
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
        date_of_birth: {
          type: Date,
          get: (v) => moment(v).format('YYYY-MM-DD'),
        },
        gender: {
          type: String,
          enum: {
            values: [Gender.FEMALE, Gender.MALE],
            message: '{VALUE} is not supported',
          },
        },
        relationship: {
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
              Relationship.SON,
              Relationship.DAUGHTER,
              Relationship.FRIEND,
            ],
            message: '{VALUE} is not supported',
          },
        },
      },
    ]),
  )
  dependants?: Dependant[];
  full_name: string;

  @Prop(
    raw({
      plan_name: { type: String },
      planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
      updatedAt: { type: Date },
    }),
  )
  plan: any;

  @Prop(
    raw({
      category: {
        type: String,
        enum: {
          values: [
            SpecialistCategories.THERAPIST,
            SpecialistCategories.MEDICAL_DOCTOR,
            SpecialistCategories.CARE_GIVER,
            SpecialistCategories.DIETITIAN,
            SpecialistCategories.LAB_TECHNICIAN,
            SpecialistCategories.PHARMACIST,
          ],
        },
      },
      area_of_specialty: { type: String },
      university: {
        name: { type: String },
        start_year: { type: String },
        end_year: { type: String },
      },
      place_of_housemanship: {
        name: { type: String },
        start_year: { type: Date },
        end_year: { type: Date },
      },
      license_number: { type: String },
      years_of_practice: { type: String },
    }),
  )
  professional_practice?: ProfessionalPractice;

  @Prop({ type: String })
  payment_structure: PaymentStructure;

  @Prop(
    raw([
      {
        type_of_document: { type: String },
        url: { type: String },
        file_type: { type: String },
        original_name: { type: String },
      },
    ]),
  )
  documents: Documents[];

  @Prop(
    raw([
      {
        title: { type: String },
        description: { type: String },
        date: { type: String },
        file: [
          {
            file_type: { type: String },
            original_name: { type: String },
            url: { type: String },
          },
        ],
      },
    ]),
  )
  awards: Award[];

  @Prop({ type: String, default: 0 })
  earnings: string;

  @Prop({ type: Number, default: 0 })
  average_rating: number;

  @Prop({
    type: String,
    enum: {
      values: [
        VerificationStatus.SUSPENDED,
        VerificationStatus.VERIFIED,
        VerificationStatus.UNVERIFIED,
      ],
    },
    default: VerificationStatus.UNVERIFIED,
  })
  verification_status: VerificationStatus;

  @Prop({
    type: String,
    enum: {
      values: [
        ProfileStatus.ACTIVE,
        ProfileStatus.CANCELLED,
        ProfileStatus.INACTIVE,
      ],
    },
    default: ProfileStatus.ACTIVE,
  })
  status: ProfileStatus;

  @Prop(
    raw({
      question: { type: String, required: true },
      answer: { type: String, required: true },
      _id: { required: false },
    }),
  )
  security: Security;
}
const UserSchema = SchemaFactory.createForClass(User);
UserSchema.virtual('full_name').get(function (this: UserDocument) {
  return `${this.profile.first_name} ${this.profile.last_name}`;
});

UserSchema.index({
  'profile.first_name': 'text',
  'profile.last_name': 'text',
  'profile.contact.email': 'text',
  'professional_practice.category': 'text',
  'profile.gender': 'text',
  user_type: 'text',
});

export { UserSchema };
