import { AdminStatus, Role } from '../types/admin.types';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty()
  @IsString()
  readonly first_name: string;
  @IsNotEmpty()
  @IsString()
  readonly last_name: string;
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
  @IsNotEmpty()
  @IsString()
  readonly password: string;
  @IsNotEmpty()
  @IsEnum(AdminStatus)
  readonly status: AdminStatus;
  @IsNotEmpty()
  @IsEnum(Role)
  readonly role: Role;
}
