import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeIntervention } from './entities/type-intervention.entity';
import { CreateTypeInterventionDto } from './dto/create-type-intervention.dto';

@Injectable()
export class ReferentielsService {
  constructor(
    @InjectRepository(TypeIntervention)
    private readonly typeRepository: Repository<TypeIntervention>,
  ) {}

  async findAllTypes(onlyActive = true): Promise<TypeIntervention[]> {
    const where = onlyActive ? { actif: true } : {};
    return this.typeRepository.find({
      where,
      order: { ordre: 'ASC', libelle: 'ASC' },
    });
  }

  async createType(createDto: CreateTypeInterventionDto): Promise<TypeIntervention> {
    const type = this.typeRepository.create(createDto);
    return this.typeRepository.save(type);
  }

  async toggleType(id: number): Promise<TypeIntervention> {
    const type = await this.typeRepository.findOneBy({ id });
    if (type) {
      type.actif = !type.actif;
      return this.typeRepository.save(type);
    }
    throw new Error('Type d''intervention introuvable');
  }
}
