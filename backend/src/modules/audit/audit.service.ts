import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async enregistrer(data: {
    utilisateurId?: string;
    action: string;
    entite?: string;
    entiteId?: string;
    details?: any;
    ipAdresse?: string;
  }): Promise<void> {
    try {
      const log = this.auditRepository.create(data);
      await this.auditRepository.save(log);
    } catch (error) {
      // Ne jamais faire échouer la requête principale à cause du log d'audit
      console.error('Échec de l''enregistrement de l''audit log:', error);
    }
  }

  async findAll(limit = 100, offset = 0) {
    return this.auditRepository.find({
      relations: ['utilisateur'],
      order: { enregistreLe: 'DESC' },
      take: limit,
      skip: offset,
    });
  }
}
