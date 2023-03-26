import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Preferences, TimeAvailability } from '../types/preference.types';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type SpecialistPreferencesDocument =
  HydratedDocument<SpecialistPreferences>;

@Schema({ collection: 'specialist_preferences' })
export class SpecialistPreferences {
  @Prop(
    raw([
      {
        day: { type: String, required: true },
        start_time: {
          type: String,
          required: true,
        },
        end_time: { type: String, required: true },
      },
    ]),
  )
  time_availability: TimeAvailability[];

  @Prop(
    raw({
      gender: { type: String, default: 'All' },
      language: { type: String, default: 'English (African)' },
      timezone: { type: String, default: 'UTC + 1 (West African Time)' },
    }),
  )
  preferences: Preferences;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;
}
export const SpecialistPreferencesSchema = SchemaFactory.createForClass(
  SpecialistPreferences,
);
