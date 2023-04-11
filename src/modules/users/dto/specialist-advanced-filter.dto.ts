import { Gender } from '../types/profile.types';
import { ProfileStatus } from '../entities/user.entity';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class SpecialistAdvancedFilterDto {
  @IsNotEmpty()
  currentPage: number;

  @IsOptional()
  pageLimit: number;

  @IsOptional()
  search: string;

  @IsOptional()
  gender: Gender;

  @IsOptional()
  country: string;

  @IsOptional()
  state: string;

  @IsOptional()
  category: string;

  @IsOptional()
  dateReg: Date;

  @IsOptional()
  status: ProfileStatus;
}
