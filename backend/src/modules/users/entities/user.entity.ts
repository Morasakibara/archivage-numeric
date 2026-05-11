import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../../common/types/roles.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nom: string;

  @Column({ length: 100 })
  prenom: string;

  @Column({ length: 50, unique: true })
  identifiant: string;

  @Column({ length: 150, unique: true, nullable: true })
  email: string;

  @Column({ name: 'mot_de_passe', select: false }) // Ne jamais retourner le MDP par défaut
  motDePasse: string;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role: Role;

  @Column({ default: true })
  actif: boolean;

  @Column({ name: 'premiere_connexion', default: true })
  premiereConnexion: boolean;

  @Column({ name: 'tentatives_echec', default: 0 })
  tentativesEchec: number;

  @Column({ default: false })
  bloque: boolean;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'modifie_le' })
  modifieLe: Date;
}
