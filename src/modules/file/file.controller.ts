import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post, Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { multerOptions } from '@shared/configs';
import { HttpUser } from '@shared/decorators';
import { JWTAuthGuard } from '@shared/guards';
import { FastifyFileInterceptor } from '@shared/interseptors';
import { HttpUserPayload } from '@shared/types';

import { FileEventDto } from '@modules/file/dto';
import { FileService } from '@modules/file/file.service';
import { File } from '@modules/file/types';
import { GetFileInstanceQueryDto } from '@modules/sherry/dto/request';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
  ) {}

  @Get(':sherryId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JWTAuthGuard)
  async getAllBySherryId(
  @HttpUser() user: HttpUserPayload,
    @Param('sherryId', ParseUUIDPipe) sherryId: string,
  ) {
    return this.fileService.getFilesBySherryId(sherryId, user);
  }

  @Get(':sherryId/path')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JWTAuthGuard)
  async getById(
  @HttpUser() user: HttpUserPayload,
    @Param('sherryId', ParseUUIDPipe) sherryId: string,
    @Query() query: GetFileInstanceQueryDto,
  ) {
    return this.fileService.getFileByPathAndSherryId(sherryId, query.path, user);
  }

  @Get('instance/:sherryId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JWTAuthGuard)
  async getFileByPath(
  @HttpUser() user: HttpUserPayload,
    @Param('sherryId', ParseUUIDPipe) sherryId: string,
    @Query() query: GetFileInstanceQueryDto,
  ) {
    return this.fileService.getFileInstance(
      sherryId,
      query.path,
      user,
    );
  }

  @Post('event')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(FastifyFileInterceptor('file', multerOptions))
  async createFileEvent(
  @HttpUser() user: HttpUserPayload,
    @UploadedFile() file: File,
    @Body() fileEventDto: FileEventDto,
  ) {
    return this.fileService.storeFile(
      file,
      {
        ...fileEventDto,
        size: fileEventDto.size ? +fileEventDto.size : 0,
      },
      user,
    );
  }
}
