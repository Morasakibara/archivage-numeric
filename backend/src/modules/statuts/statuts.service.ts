import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Dossier } from '../../dossiers/entities/dossier.entity';
import { HistoriqueStatut } from './entities/historique-statut.entity';
import { ChangerStatutDto } from './dto/changer-statut.dto';
import { transitionAutorisee } from './statuts-transitions';
import { Role } from '../../common/types/roles.enum';
import { StatutDossier } from '../../common/types/statuts.enum';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class StatutsService {
  constructor(
    @InjectRepository(Dossier)
    private readonly dossierRepository: Repository<Dossier>,
    @InjectRepository(HistoriqueStatut)
    private readonly historiqueRepository: Repository<HistoriqueStatut>,
    private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
  ) {}

  async changerStatut(
    dossierId: string,
    changerStatutDto: ChangerStatutDto,
    utilisateur: { id: string; role: Role; prenom: string; nom: string },
  ): Promise<Dossier> {
    const dossier = await this.dossierRepository.findOne({
      where: { id: dossierId },
      relations: ['createur', 'assigne'],
    });
    if (!dossier) {
      throw new BadRequestException('Dossier introuvable');
    }

    if (dossier.statut === StatutDossier.ARCHIVE) {
      throw new BadRequestException('Un dossier archivé ne peut plus changer de statut');
    }

    if (!transitionAutorisee(dossier.statut, changerStatutDto.nouveauStatut, utilisateur.role)) {
      throw new ForbiddenException('Transition de statut non autorisée pour votre rôle');
    }

    // Validation spécifique pour l'archivage
    if (
      changerStatutDto.nouveauStatut === StatutDossier.ARCHIVE &&
      dossier.statut !== StatutDossier.VALIDE
    ) {
      throw new BadRequestException('Seul un dossier validé peut être archivé');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const statutAvant = dossier.statut;
      dossier.statut = changerStatutDto.nouveauStatut;
      
      if (changerStatutDto.nouveauStatut === StatutDossier.REJETE) {
        dossier.motifRejet = changerStatutDto.commentaire;
      }

      if (changerStatutDto.nouveauStatut === StatutDossier.ARCHIVE) {
        dossier.archiveLe = new Date();
      }

      await queryRunner.manager.save(dossier);

      const historique = this.historiqueRepository.create({
        dossierId,
        statutAvant,
        statutApres: changerStatutDto.nouveauStatut,
        commentaire: changerStatutDto.commentaire,
        effectueParId: utilisateur.id,
      });

      await queryRunner.manager.save(historique);

      // Création des notifications pour les parties prenantes
      const destinataires = new Set<string>();
      if (dossier.createurId !== utilisateur.id) destinataires.add(dossier.createurId);
      if (dossier.assigneId && dossier.assigneId !== utilisateur.id) destinataires.add(dossier.assigneId);

      for (const destId of destinataires) {
        await this.notificationsService.create({
          destinataireId: destId,
          dossierId,
          type: 'changement_statut',
          message: `Le dossier ${dossier.numero} est passé de "${statutAvant}" à "${dossier.statut}" par ${utilisateur.prenom} ${utilisateur.nom}.`,
        });
      }

      await queryRunner.commitTransaction();
      return dossier;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getHistorique(dossierId: string): Promise<HistoriqueStatut[]> {
    return this.historiqueRepository.find({
      where: { dossierId },
      relations: ['effectuePar'],
      order: { effectueLe: 'DESC' },
    });
  }
}
