import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dossier } from '../dossiers/entities/dossier.entity';
import { Parser } from 'json2csv';
import * as PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Dossier)
    private readonly dossierRepository: Repository<Dossier>,
  ) {}

  async generateCsv(params: any): Promise<string> {
    const dossiers = await this.dossierRepository.find({
      where: params,
      relations: ['createur'],
    });

    const fields = [
      { label: 'Numéro', value: 'numero' },
      { label: 'Client', value: 'nomClient' },
      { label: 'Compteur', value: 'numeroCompteur' },
      { label: 'Type', value: 'typeIntervention' },
      { label: 'Statut', value: 'statut' },
      { label: 'Priorité', value: 'priorite' },
      { label: 'Créé par', value: (row) => `${row.createur.prenom} ${row.createur.nom}` },
      { label: 'Date création', value: (row) => new Date(row.creeLe).toLocaleDateString('fr-FR') },
    ];

    const json2csvParser = new Parser({ fields });
    return json2csvParser.parse(dossiers);
  }

  async generatePdf(dossierId: string): Promise<Buffer> {
    const dossier = await this.dossierRepository.findOne({
      where: { id: dossierId },
      relations: ['createur', 'assigne'],
    });

    if (!dossier) throw new Error('Dossier introuvable');

    const fonts = {
      Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      }
    };

    const printer = new PdfPrinter(fonts);

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: `FICHE DOSSIER : ${dossier.numero}`, style: 'header' },
        { text: '\n' },
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'INFORMATIONS CLIENT', style: 'subheader' },
                { text: `Nom : ${dossier.nomClient}` },
                { text: `Téléphone : ${dossier.telephoneClient || 'N/A'}` },
                { text: `N° Compteur : ${dossier.numeroCompteur}` },
              ]
            },
            {
              width: '*',
              stack: [
                { text: 'DÉTAILS INTERVENTION', style: 'subheader' },
                { text: `Type : ${dossier.typeIntervention}` },
                { text: `Statut actuel : ${dossier.statut.toUpperCase()}` },
                { text: `Priorité : ${dossier.priorite.toUpperCase()}` },
              ]
            }
          ]
        },
        { text: '\n' },
        { text: 'DESCRIPTION', style: 'subheader' },
        { text: dossier.description || 'Aucune description fournie.' },
        { text: '\n' },
        { text: 'TRAÇABILITÉ', style: 'subheader' },
        { text: `Dossier créé le : ${new Date(dossier.creeLe).toLocaleString('fr-FR')}` },
        { text: `Par : ${dossier.createur.prenom} ${dossier.createur.nom}` },
      ],
      styles: {
        header: { fontSize: 22, bold: true, color: '#2563eb' },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5], color: '#4b5563' }
      }
    };

    return new Promise((resolve, reject) => {
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', (err) => reject(err));
      pdfDoc.end();
    });
  }
}
