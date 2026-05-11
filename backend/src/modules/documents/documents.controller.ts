import {
  Controller,
  Get,
  Post,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/types/roles.enum';

@Controller()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('dossiers/:id/documents')
  @UseInterceptors(FileInterceptor('file'))
  uploadPhoto(
    @Param('id') dossierId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.documentsService.uploadPhoto(dossierId, file, req.user.id);
  }

  @Get('dossiers/:id/documents')
  findByDossier(@Param('id') dossierId: string) {
    return this.documentsService.findByDossier(dossierId);
  }

  @Get('documents/:id/url')
  getPresignedUrl(@Param('id') documentId: string) {
    return this.documentsService.getPresignedUrl(documentId);
  }

  @Patch('documents/:id/invalider')
  @Roles(Role.SUPERVISEUR, Role.ADMIN)
  invalidate(@Param('id') documentId: string) {
    return this.documentsService.invalidate(documentId);
  }
}
