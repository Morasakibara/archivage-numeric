import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { PrioriteDossier } from '../entities/dossier.entity';

export class CreateDossierDto {
  @IsString()
  @IsNotEmpty()
  nomClient: string;

  @IsString()
  @IsOptional()
  telephoneClient?: string;

  @IsString()
  @IsNotEmpty()
  numeroCompteur: string;

  @IsString()
  @IsNotEmpty()
  typeIntervention: string;

  @IsEnum(PrioriteDossier)
  @IsOptional()
  priorite?: PrioriteDossier;

  @IsString()
  @IsOptional()
  description?: string;
}
