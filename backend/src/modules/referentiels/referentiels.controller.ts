import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ReferentielsService } from './referentiels.service';
import { CreateTypeInterventionDto } from './dto/create-type-intervention.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/types/roles.enum';
import { Public } from '../../common/decorators/public.decorator';

@Controller('referentiels')
export class ReferentielsController {
  constructor(private readonly referentielsService: ReferentielsService) {}

  @Public()
  @Get('types')
  findAllTypes() {
    return this.referentielsService.findAllTypes();
  }

  @Post('types')
  @Roles(Role.ADMIN)
  createType(@Body() createDto: CreateTypeInterventionDto) {
    return this.referentielsService.createType(createDto);
  }

  @Patch('types/:id/toggle')
  @Roles(Role.ADMIN)
  toggleType(@Param('id') id: number) {
    return this.referentielsService.toggleType(id);
  }
}
