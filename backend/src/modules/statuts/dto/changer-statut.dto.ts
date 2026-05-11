import { IsEnum, IsString, IsOptional, MinLength, ValidateIf } from 'class-validator';
import { StatutDossier } from '../../../common/types/statuts.enum';

export class ChangerStatutDto {
  @IsEnum(StatutDossier)
  nouveauStatut: StatutDossier;

  @ValidateIf((o) => o.nouveauStatut === StatutDossier.REJETE)
  @IsString()
  @MinLength(20, { message: 'Le motif de rejet doit faire au moins 20 caractères' })
  commentaire: string;
}
