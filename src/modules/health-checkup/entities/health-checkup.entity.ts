import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export enum CheckupOwner {
  DEPENDANT = 'Dependant',
  SELF = 'Self',
  THIRD_PARTY = 'Third Party',
}
export type HealthCheckupDocument = HydratedDocument<HealthCheckup>;

@Schema({
  collection: 'health_checkups',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class HealthCheckup {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({
    type: String,
    enum: {
      values: [
        CheckupOwner.SELF,
        CheckupOwner.DEPENDANT,
        CheckupOwner.THIRD_PARTY,
      ],
    },
    default: CheckupOwner.SELF,
  })
  health_check_for: CheckupOwner;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  checkup_owner_id: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  request: any;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  response: any;
}
export const HealthCheckupSchema = SchemaFactory.createForClass(HealthCheckup);
