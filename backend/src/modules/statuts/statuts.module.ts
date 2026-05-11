import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoriqueStatut } from './entities/historique-statut.entity';
import { Dossier } from '../dossiers/entities/dossier.entity';
import { StatutsService } from './statuts.service';
import { StatutsController } from './statuts.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HistoriqueStatut, Dossier]),
    NotificationsModule,
  ],
  controllers: [StatutsController],
  providers: [StatutsService],
  exports: [StatutsService],
})
export class StatutsModule {}
