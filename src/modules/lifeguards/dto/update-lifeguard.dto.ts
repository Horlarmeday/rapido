import { PartialType } from '@nestjs/mapped-types';
import { CreateLifeguardDto } from './create-lifeguard.dto';

export class UpdateLifeguardDto extends PartialType(CreateLifeguardDto) {}
