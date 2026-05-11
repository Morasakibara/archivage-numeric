import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Dossier } from '../../dossiers/entities/dossier.entity';
import { User } from '../../users/entities/user.entity';
import { StatutDossier } from '../../../common/types/statuts.enum';

@Entity('historique_statuts')
export class HistoriqueStatut {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dossier_id' })
  dossierId: string;

  @ManyToOne(() => Dossier)
  @JoinColumn({ name: 'dossier_id' })
  dossier: Dossier;

  @Column({ name: 'statut_avant', type: 'varchar', length: 50, nullable: true })
  statutAvant: StatutDossier;

  @Column({ name: 'statut_apres', type: 'varchar', length: 50 })
  statutApres: StatutDossier;

  @Column({ type: 'text', nullable: true })
  commentaire: string;

  @Column({ name: 'effectue_par' })
  effectueParId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'effectue_par' })
  effectuePar: User;

  @CreateDateColumn({ name: 'effectue_le' })
  effectueLe: Date;
}
