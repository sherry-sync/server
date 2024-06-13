import {
  Body,
  Controller, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';

import { multerOptions } from '@shared/configs';
import { HttpUser } from '@shared/decorators';
import { JWTAuthGuard } from '@shared/guards';
import { FastifyFileInterceptor } from '@shared/interseptors';
import { HttpUserPayload } from '@shared/types';

import { FileEventDto } from '@modules/file/dto';
import { FileService } from '@modules/file/file.service';
import { File } from '@modules/file/types';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
  ) {}

  @Post('event')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(FastifyFileInterceptor('file', multerOptions))
  async createFileEvent(
  @HttpUser() user: HttpUserPayload,
    @UploadedFile() file: File,
    @Body() fileEventDto: FileEventDto,
  ) {
    await this.fileService.storeFile(
      file,
      {
        ...fileEventDto,
        size: fileEventDto.size ? +fileEventDto.size : 0,
      },
      user,
    );
  }
}
