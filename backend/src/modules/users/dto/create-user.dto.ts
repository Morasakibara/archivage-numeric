import { IsString, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { Role } from '../../../common/types/roles.enum';

export class CreateUserDto {
  @IsString()
  nom: string;

  @IsString()
  prenom: string;

  @IsString()
  identifiant: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(Role)
  role: Role;

  @IsString()
  @MinLength(8)
  motDePasse: string;
}
