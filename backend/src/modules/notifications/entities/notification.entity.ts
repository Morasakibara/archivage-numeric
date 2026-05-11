import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Dossier } from '../../dossiers/entities/dossier.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'destinataire_id' })
  destinataireId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'destinataire_id' })
  destinataire: User;

  @Column({ name: 'dossier_id', nullable: true })
  dossierId: string;

  @ManyToOne(() => Dossier)
  @JoinColumn({ name: 'dossier_id' })
  dossier: Dossier;

  @Column({ length: 50 })
  type: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  lu: boolean;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;
}
