import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  AdminDefaultSettingsTypes,
  PaymentProvider,
  SpecialistRate,
} from '../types/admin-settings.types';
import { HydratedDocument } from 'mongoose';

export type AdminSettingsDocument = HydratedDocument<AdminSetting>;

@Schema({
  collection: 'admin_settings',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class AdminSetting {
  @Prop(
    raw({
      payment_provider: {
        type: String,
        enum: {
          values: [
            PaymentProvider.PAYSTACK,
            PaymentProvider.FLUTTERWAVE,
            PaymentProvider.STRIPE,
          ],
        },
        required: true,
        default: PaymentProvider.PAYSTACK,
      },
    }),
  )
  defaults: AdminDefaultSettingsTypes;

  @Prop(
    raw([
      {
        category: { type: String },
        specialization: { type: String },
        rate: raw({
          number: { type: Number },
          unit: { type: String },
        }),
      },
    ]),
  )
  specialist_rates: SpecialistRate[];
}
export const AdminSettingSchema = SchemaFactory.createForClass(AdminSetting);
