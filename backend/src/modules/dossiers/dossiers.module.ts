import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dossier } from './entities/dossier.entity';
import { DossiersService } from './dossiers.service';
import { DossiersNumeroService } from './dossiers-numero.service';
import { DossiersController } from './dossiers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Dossier])],
  controllers: [DossiersController],
  providers: [DossiersService, DossiersNumeroService],
  exports: [DossiersService],
})
export class DossiersModule {}
