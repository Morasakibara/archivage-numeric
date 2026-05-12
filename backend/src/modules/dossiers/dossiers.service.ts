import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Dossier } from './entities/dossier.entity';
import { CreateDossierDto } from './dto/create-dossier.dto';
import { UpdateDossierDto } from './dto/update-dossier.dto';
import { SearchDossierDto } from './dto/search-dossier.dto';
import { DossiersNumeroService } from './dossiers-numero.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DossiersService {
  constructor(
    @InjectRepository(Dossier)
    private readonly dossierRepository: Repository<Dossier>,
    private readonly numeroService: DossiersNumeroService,
    private readonly auditService: AuditService,
  ) {}

  async create(createDto: CreateDossierDto, createurId: string): Promise<Dossier> {
    const numero = await this.numeroService.genererNumero();
    const dossier = this.dossierRepository.create({
      ...createDto,
      numero,
      createurId,
    });
    return this.dossierRepository.save(dossier);
  }

  async findOne(id: string, utilisateurId?: string): Promise<Dossier> {
    const dossier = await this.dossierRepository.findOne({
      where: { id },
      relations: ['createur', 'assigne'],
    });
    if (!dossier) {
      throw new NotFoundException(`Dossier avec l'ID ${id} introuvable`);
    }

    if (utilisateurId) {
      this.auditService.enregistrer({
        utilisateurId,
        action: 'consultation_dossier',
        entite: 'dossier',
        entiteId: id,
        details: { numero: dossier.numero },
      });
    }

    return dossier;
  }

  async findByNumero(numero: string): Promise<Dossier> {
    const dossier = await this.dossierRepository.findOne({
      where: { numero },
      relations: ['createur', 'assigne'],
    });
    if (!dossier) {
      throw new NotFoundException(`Dossier avec le numéro ${numero} introuvable`);
    }
    return dossier;
  }

  async search(searchDto: SearchDossierDto) {
    const { q, statut, typeIntervention, priorite, createurId, assigneId, page, limit } = searchDto;
    const query = this.dossierRepository.createQueryBuilder('d')
      .leftJoinAndSelect('d.createur', 'createur')
      .leftJoinAndSelect('d.assigne', 'assigne');

    if (q) {
      query.andWhere(
        '(d.numero ILIKE :q OR d.nom_client ILIKE :q OR d.numero_compteur ILIKE :q)',
        { q: `%${q}%` },
      );
    }

    if (statut) query.andWhere('d.statut = :statut', { statut });
    if (typeIntervention) query.andWhere('d.type_intervention = :typeIntervention', { typeIntervention });
    if (priorite) query.andWhere('d.priorite = :priorite', { priorite });
    if (createurId) query.andWhere('d.createur_id = :createurId', { createurId });
    if (assigneId) query.andWhere('d.assigne_id = :assigneId', { assigneId });

    query.orderBy('d.cree_le', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async update(id: string, updateDto: UpdateDossierDto): Promise<Dossier> {
    const dossier = await this.findOne(id);
    Object.assign(dossier, updateDto);
    return this.dossierRepository.save(dossier);
  }
}
