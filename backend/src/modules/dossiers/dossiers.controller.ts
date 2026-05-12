import { Controller, Get, Post, Body, Param, Put, Query, Request } from '@nestjs/common';
import { DossiersService } from './dossiers.service';
import { CreateDossierDto } from './dto/create-dossier.dto';
import { UpdateDossierDto } from './dto/update-dossier.dto';
import { SearchDossierDto } from './dto/search-dossier.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/types/roles.enum';

@Controller('dossiers')
export class DossiersController {
  constructor(private readonly dossiersService: DossiersService) {}

  @Post()
  create(@Body() createDto: CreateDossierDto, @Request() req) {
    return this.dossiersService.create(createDto, req.user.id);
  }

  @Get()
  search(@Query() searchDto: SearchDossierDto) {
    return this.dossiersService.search(searchDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.dossiersService.findOne(id, req.user.id);
  }

  @Get('numero/:numero')
  findByNumero(@Param('numero') numero: string) {
    return this.dossiersService.findByNumero(numero);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateDossierDto) {
    return this.dossiersService.update(id, updateDto);
  }
}
