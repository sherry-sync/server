import {
  Controller, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { File } from 'fastify-multer/lib/interfaces';

import { JWTAuthGuard } from '@shared/guards';
import { SingleFileInterceptor } from '@shared/interseptors';

import { FileService } from '@modules/file/file.service';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
  ) {}

  @Post('event')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(SingleFileInterceptor('file', 'uploads'))
  async createFileEvent(
  @UploadedFile() file: File,
  ) {
    await this.fileService.storeFile(
      file as unknown as { path: string; originalName: string; mimeType: string },
    );
  }
}
