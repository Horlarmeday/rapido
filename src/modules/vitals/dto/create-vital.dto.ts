import { IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class CreateVitalDto {
  @IsNotEmpty()
  @IsObject()
  readonly body_temp: Record<number, string>;

  @IsOptional()
  @IsObject()
  readonly body_weight: Record<number, string>;

  @IsOptional()
  @IsObject()
  readonly blood_pressure: Record<number, string>;

  @IsOptional()
  @IsObject()
  readonly blood_sugar_level: Record<number, string>;

  @IsOptional()
  @IsObject()
  readonly pulse_rate: Record<number, string>;
}
