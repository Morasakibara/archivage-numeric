import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PrioriteDossier } from '../entities/dossier.entity';

export class UpdateDossierDto {
  @IsString()
  @IsOptional()
  nomClient?: string;

  @IsString()
  @IsOptional()
  telephoneClient?: string;

  @IsString()
  @IsOptional()
  numeroCompteur?: string;

  @IsString()
  @IsOptional()
  typeIntervention?: string;

  @IsEnum(PrioriteDossier)
  @IsOptional()
  priorite?: PrioriteDossier;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  assigneId?: string;
}
