import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../../common/types/roles.enum';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  nom?: string;

  @IsString()
  @IsOptional()
  prenom?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
