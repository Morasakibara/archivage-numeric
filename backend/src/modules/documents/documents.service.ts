import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { MinioService } from './minio.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly minioService: MinioService,
  ) {}

  async uploadPhoto(
    dossierId: string,
    file: Express.Multer.File,
    uploadeParId: string,
  ): Promise<Document> {
    const now = new Date();
    const annee = now.getFullYear();
    const mois = String(now.getMonth() + 1).padStart(2, '0');
    const extension = file.originalname.split('.').pop();
    const fileName = `${annee}/${mois}/${dossierId}/${uuidv4()}.${extension}`;

    const cheminStockage = await this.minioService.uploadFile(
      fileName,
      file.buffer,
      file.mimetype,
    );

    const document = this.documentRepository.create({
      dossierId,
      nomFichier: file.originalname,
      cheminStockage,
      tailleOctets: file.size,
      typeMime: file.mimetype,
      uploadeParId,
    });

    return this.documentRepository.save(document);
  }

  async findByDossier(dossierId: string): Promise<Document[]> {
    return this.documentRepository.find({
      where: { dossierId, valide: true },
      order: { ordre: 'ASC' },
    });
  }

  async getPresignedUrl(documentId: string): Promise<string> {
    const document = await this.documentRepository.findOneBy({ id: documentId });
    if (!document) {
      throw new NotFoundException('Document introuvable');
    }
    return this.minioService.getPresignedUrl(document.cheminStockage);
  }

  async invalidate(documentId: string): Promise<Document> {
    const document = await this.documentRepository.findOneBy({ id: documentId });
    if (!document) {
      throw new NotFoundException('Document introuvable');
    }
    document.valide = false;
    return this.documentRepository.save(document);
  }
}
