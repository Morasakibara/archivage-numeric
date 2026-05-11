import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateTypeInterventionDto {
  @IsString()
  libelle: string;

  @IsInt()
  @IsOptional()
  ordre?: number;
}
