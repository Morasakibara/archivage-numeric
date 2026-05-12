import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  ancienMotDePasse: string;

  @IsString()
  @MinLength(8)
  nouveauMotDePasse: string;
}
oins 8 caractères' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Le mot de passe est trop faible (doit contenir 1 majuscule, 1 minuscule, 1 chiffre ou symbole)',
  })
  nouveauMotDePasse: string;
}
