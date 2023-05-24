import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum RatingFilter {
  ONE_STAR_AND_ABOVE = '1 star and above',
  TWO_STARS_AND_ABOVE = '2 stars and above',
  THREE_STARS_AND_ABOVE = '3 stars and above',
  FOUR_STARS_AND_ABOVE = '4 stars and above',
  FIVE_STARS = '5 stars',
}
export class AvailabilityParam {
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;

  @IsString()
  time: string;
}

export class AvailableSpecialistQueryDto {
  @IsNotEmpty()
  @IsString()
  professional_category: string;

  @IsNotEmpty()
  @IsString()
  specialist_category: string;

  @IsOptional()
  gender: string;

  @IsOptional()
  rating: RatingFilter;

  @IsNotEmpty()
  @IsString()
  time_zone: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityParam)
  availabilityDates: AvailabilityParam[];
}
