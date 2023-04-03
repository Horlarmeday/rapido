import { Injectable } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rating, RatingDocument } from './entities/rating.entity';
import { find, findOne, upsert } from '../../common/crud/crud';
import { UsersService } from '../users/users.service';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
    private usersService: UsersService,
  ) {}
  async createRating(
    createRatingDto: CreateRatingDto,
    reviewer: Types.ObjectId,
  ) {
    const { specialist, ...rest } = createRatingDto;
    const rating = await upsert(
      this.ratingModel,
      { specialist },
      {
        $setOnInsert: { specialist },
        $push: { ratings: { ...rest, reviewer } },
      },
    );
    const avgRating = await this.getSpecialistAverageRating(specialist);
    await this.usersService.updateOne(specialist, {
      average_rating: +avgRating,
    });
    return rating;
  }

  async getSpecialistRatings(specialist: Types.ObjectId) {
    return await find(
      this.ratingModel,
      { specialist },
      {
        populate: 'specialist',
        populateSelectFields: ['profile.first_name', 'profile.last_name'],
      },
    );
  }

  async getSpecialistAverageRating(specialist: Types.ObjectId) {
    const rating = (await findOne(this.ratingModel, { specialist })) as Rating;
    const numbRatings = rating?.ratings?.length;
    const sumRatings = rating?.ratings.reduce(
      (acc, cur) => acc + cur.rating,
      0,
    );
    const averageRating = sumRatings / numbRatings || 0;
    return averageRating.toFixed(1);
  }
}
