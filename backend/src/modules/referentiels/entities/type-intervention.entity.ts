import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('types_intervention')
export class TypeIntervention {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  libelle: string;

  @Column({ default: true })
  actif: boolean;

  @Column({ default: 0 })
  ordre: number;
}
