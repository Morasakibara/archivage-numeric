import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/types/roles.enum';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('export/csv')
  @Roles(Role.SUPERVISEUR, Role.ADMIN)
  async exportCsv(@Query() params: any, @Res() res: Response) {
    const csv = await this.reportsService.generateCsv(params);
    res.header('Content-Type', 'text/csv');
    res.attachment(`export_dossiers_${new Date().getTime()}.csv`);
    return res.send(csv);
  }

  @Get('dossier/:id/pdf')
  async exportDossierPdf(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.reportsService.generatePdf(id);
    res.header('Content-Type', 'application/pdf');
    res.attachment(`dossier_${id}.pdf`);
    return res.send(buffer);
  }
}
