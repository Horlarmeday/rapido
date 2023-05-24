import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';

export class TimesParam {
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;
}

export class AvailableTimesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimesParam)
  preferredDates: TimesParam[];
}
