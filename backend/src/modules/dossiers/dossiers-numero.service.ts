import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dossier } from './entities/dossier.entity';

@Injectable()
export class DossiersNumeroService {
  constructor(
    @InjectRepository(Dossier)
    private readonly dossierRepo: Repository<Dossier>,
  ) {}

  async genererNumero(): Promise<string> {
    const annee = new Date().getFullYear();
    const prefixe = `ELC-${annee}-`;

    const dernier = await this.dossierRepo
      .createQueryBuilder('d')
      .where('d.numero LIKE :prefixe', { prefixe: `${prefixe}%` })
      .orderBy('d.numero', 'DESC')
      .getOne();

    let sequence = 1;
    if (dernier) {
      const parts = dernier.numero.split('-');
      if (parts.length === 3) {
        sequence = parseInt(parts[2], 10) + 1;
      }
    }

    return `${prefixe}${String(sequence).padStart(5, '0')}`;
  }
}
