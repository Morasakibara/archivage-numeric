import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { StatutDossier } from '../../../common/types/statuts.enum';

export enum PrioriteDossier {
  NORMALE = 'normale',
  URGENTE = 'urgente',
}

@Entity('dossiers')
export class Dossier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20, unique: true })
  numero: string;

  @Column({ name: 'nom_client', length: 200 })
  nomClient: string;

  @Column({ name: 'telephone_client', length: 20, nullable: true })
  telephoneClient: string;

  @Column({ name: 'numero_compteur', length: 50 })
  numeroCompteur: string;

  @Column({ name: 'type_intervention', length: 100 })
  typeIntervention: string;

  @Column({
    type: 'enum',
    enum: PrioriteDossier,
    default: PrioriteDossier.NORMALE,
  })
  priorite: PrioriteDossier;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: StatutDossier,
    default: StatutDossier.NOUVEAU,
  })
  statut: StatutDossier;

  @Column({ name: 'createur_id' })
  createurId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createur_id' })
  createur: User;

  @Column({ name: 'assigne_id', nullable: true })
  assigneId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigne_id' })
  assigne: User;

  @Column({ name: 'motif_rejet', type: 'text', nullable: true })
  motifRejet: string;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'modifie_le' })
  modifieLe: Date;

  @Column({ name: 'archive_le', type: 'timestamp', nullable: true })
  archiveLe: Date;
}
