import { PartialType } from '@nestjs/mapped-types';
import { ProfileSetupDto } from './profile-setup.dto';

export class UpdateUserProfileDto extends PartialType(ProfileSetupDto) {}
