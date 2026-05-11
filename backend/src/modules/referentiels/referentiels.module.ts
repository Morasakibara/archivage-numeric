import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeIntervention } from './entities/type-intervention.entity';
import { ReferentielsService } from './referentiels.service';
import { ReferentielsController } from './referentiels.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TypeIntervention])],
  controllers: [ReferentielsController],
  providers: [ReferentielsService],
  exports: [ReferentielsService],
})
export class ReferentielsModule {}
