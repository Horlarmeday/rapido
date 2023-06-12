import { Types } from 'mongoose';
import { Item } from '../types/prescription.types';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePrescriptionDto {
  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  patient: Types.ObjectId;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Item)
  items: Item[];
}
