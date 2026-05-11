import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'utilisateur_id', nullable: true })
  utilisateurId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur: User;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 50, nullable: true })
  entite: string;

  @Column({ name: 'entite_id', nullable: true })
  entiteId: string;

  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @Column({ name: 'ip_adresse', type: 'inet', nullable: true })
  ipAdresse: string;

  @CreateDateColumn({ name: 'enregistre_le' })
  enregistreLe: Date;
}
