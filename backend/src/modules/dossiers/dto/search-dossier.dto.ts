import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { StatutDossier } from '../../../common/types/statuts.enum';
import { PrioriteDossier } from '../entities/dossier.entity';
import { Type } from 'class-transformer';

export class SearchDossierDto {
  @IsString()
  @IsOptional()
  q?: string;

  @IsEnum(StatutDossier)
  @IsOptional()
  statut?: StatutDossier;

  @IsString()
  @IsOptional()
  typeIntervention?: string;

  @IsEnum(PrioriteDossier)
  @IsOptional()
  priorite?: PrioriteDossier;

  @IsString()
  @IsOptional()
  createurId?: string;

  @IsString()
  @IsOptional()
  assigneId?: string;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
