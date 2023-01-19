import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserSettingsDefaults } from '../types/user-settings.types';

export type UserSettingsDocument = HydratedDocument<UserSetting>;

export enum TwoFAMedium {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  AUTH_APPS = 'AUTH_APPS',
}

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class UserSetting {
  @Prop({ type: String, required: true })
  userId: Types.ObjectId;

  @Prop(
    raw({
      twoFA_auth: { type: Boolean, required: true, default: true },
      marketing: { type: Boolean, required: true, default: false },
      receive_email_notifications: {
        type: Boolean,
        required: true,
        default: false,
      },
      twoFA_medium: {
        type: String,
        enum: {
          values: [TwoFAMedium.SMS, TwoFAMedium.AUTH_APPS, TwoFAMedium.EMAIL],
        },
        default: TwoFAMedium.EMAIL,
      },
    }),
  )
  defaults: UserSettingsDefaults;
}
export const UserSettingSchema = SchemaFactory.createForClass(UserSetting);
