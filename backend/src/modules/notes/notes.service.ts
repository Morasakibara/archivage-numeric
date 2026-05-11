import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
  ) {}

  async create(dossierId: string, createNoteDto: CreateNoteDto, auteurId: string): Promise<Note> {
    const note = this.noteRepository.create({
      dossierId,
      ...createNoteDto,
      auteurId,
    });
    return this.noteRepository.save(note);
  }

  async findByDossier(dossierId: string): Promise<Note[]> {
    return this.noteRepository.find({
      where: { dossierId },
      relations: ['auteur'],
      order: { creeLe: 'DESC' },
    });
  }
}
