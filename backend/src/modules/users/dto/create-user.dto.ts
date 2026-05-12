import { IsString, IsEmail, IsEnum, IsOptional, MinLength, Matches } from 'class-validator';
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
re au moins 8 caractères' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Le mot de passe est trop faible (doit contenir 1 majuscule, 1 minuscule, 1 chiffre ou symbole)',
  })
  motDePasse: string;
}
