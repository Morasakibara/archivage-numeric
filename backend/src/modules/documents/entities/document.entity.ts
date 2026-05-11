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

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dossier_id' })
  dossierId: string;

  @ManyToOne(() => Dossier)
  @JoinColumn({ name: 'dossier_id' })
  dossier: Dossier;

  @Column({ name: 'nom_fichier', length: 255 })
  nomFichier: string;

  @Column({ name: 'chemin_stockage', length: 500 })
  cheminStockage: string;

  @Column({ name: 'taille_octets', type: 'integer', nullable: true })
  tailleOctets: number;

  @Column({ name: 'type_mime', length: 50, nullable: true })
  typeMime: string;

  @Column({ default: 1 })
  ordre: number;

  @Column({ default: true })
  valide: boolean;

  @Column({ name: 'uploade_par' })
  uploadeParId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploade_par' })
  uploadePar: User;

  @CreateDateColumn({ name: 'uploade_le' })
  uploadeLe: Date;
}
