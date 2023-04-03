import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { RatingsTypes } from '../types/ratings.types';

export type RatingDocument = HydratedDocument<Rating>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Rating {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  specialist: Types.ObjectId;

  @Prop(
    raw([
      {
        rating: { type: Number, min: 1, max: 5, required: true },
        message: { type: String },
        reviewer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ]),
  )
  ratings: RatingsTypes[];
}
export const RatingSchema = SchemaFactory.createForClass(Rating);
