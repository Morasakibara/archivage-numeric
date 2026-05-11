import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { StatutsService } from './statuts.service';
import { ChangerStatutDto } from './dto/changer-statut.dto';

@Controller('dossiers/:id')
export class StatutsController {
  constructor(private readonly statutsService: StatutsService) {}

  @Post('statut')
  changerStatut(
    @Param('id') dossierId: string,
    @Body() changerStatutDto: ChangerStatutDto,
    @Request() req,
  ) {
    return this.statutsService.changerStatut(dossierId, changerStatutDto, req.user);
  }

  @Get('historique')
  getHistorique(@Param('id') dossierId: string) {
    return this.statutsService.getHistorique(dossierId);
  }
}
