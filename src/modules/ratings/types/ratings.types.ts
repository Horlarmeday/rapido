import { Types } from 'mongoose';

export class RatingsTypes {
  message: string;
  rating: number;
  reviewer: Types.ObjectId;
}
