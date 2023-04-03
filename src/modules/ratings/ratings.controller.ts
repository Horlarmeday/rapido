import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { Types } from 'mongoose';
import { SpecialistAverageRating } from './dto/SpecialistAverageRating';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  async createRating(@Body() createRatingDto: CreateRatingDto, @Request() req) {
    const result = await this.ratingsService.createRating(
      createRatingDto,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.CREATED, result);
  }

  @Post('average')
  async getSpecialistAverageRating(
    @Body() specialistAverageRating: SpecialistAverageRating,
  ) {
    const result = await this.ratingsService.getSpecialistAverageRating(
      specialistAverageRating.specialistId,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get(':id')
  async getSpecialistRatings(@Param('id') id: Types.ObjectId) {
    const result = await this.ratingsService.getSpecialistRatings(id);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }
}
