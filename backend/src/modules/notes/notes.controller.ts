import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';

@Controller('dossiers/:id/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(
    @Param('id') dossierId: string,
    @Body() createNoteDto: CreateNoteDto,
    @Request() req,
  ) {
    return this.notesService.create(dossierId, createNoteDto, req.user.id);
  }

  @Get()
  findByDossier(@Param('id') dossierId: string) {
    return this.notesService.findByDossier(dossierId);
  }
}
