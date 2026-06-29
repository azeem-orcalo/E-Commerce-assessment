import { IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
