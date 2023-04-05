import { CheckupOwner } from '../entities/health-checkup.entity';
import { Types } from 'mongoose';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class BeginCheckupDto {
  @IsEnum(CheckupOwner)
  health_check_for: CheckupOwner;

  @ValidateIf(
    (e) =>
      e.health_check_for === CheckupOwner.SELF ||
      e.health_check_for === CheckupOwner.DEPENDANT,
  )
  @IsNotEmpty()
  @IsString()
  checkup_owner_id: Types.ObjectId;
}
