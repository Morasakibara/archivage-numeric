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

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dossier_id' })
  dossierId: string;

  @ManyToOne(() => Dossier)
  @JoinColumn({ name: 'dossier_id' })
  dossier: Dossier;

  @Column({ type: 'text' })
  contenu: string;

  @Column({ name: 'auteur_id' })
  auteurId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'auteur_id' })
  auteur: User;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;
}
