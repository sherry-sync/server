import { Injectable, NotFoundException } from '@nestjs/common';
import { FileName, FileType } from '@prisma/client';

import { CreateSherryDto, UpdateSherryDto } from '@modules/sherry/dto/request';
import { SherryResponseDto } from '@modules/sherry/dto/response';
import { SherryRepository } from '@modules/sherry/sherry.repository';

@Injectable()
export class SherryService {
  constructor(private readonly sherryRepository: SherryRepository) {}

  async getAllByUserId(userId: string): Promise<SherryResponseDto[]> {
    const sherries = await this.sherryRepository.getAllByUserId(userId);
    return SherryResponseDto.mapFromMulti(sherries);
  }

  async create(userId: string, dto: CreateSherryDto): Promise<SherryResponseDto> {
    const sherry = await this.sherryRepository.create({
      userId,
      name: dto.name,
      maxFileSize: dto.maxFileSize,
      maxDirSize: dto.maxDirSize,
    });

    if (dto.allowedFileNames && dto.allowedFileNames.length > 0) {
      await this.createFileNames(sherry.sherryId, dto.allowedFileNames);
    }

    if (dto.allowedFileTypes && dto.allowedFileTypes.length > 0) {
      await this.createFileTypes(sherry.sherryId, dto.allowedFileTypes);
    }

    return this.getById(userId, sherry.sherryId);
  }

  async getById(userId: string, sherryId: string): Promise<SherryResponseDto> {
    const sherry = await this.sherryRepository.getById(userId, sherryId);
    if (!sherry) {
      throw new NotFoundException(`Sherry with id ${sherryId} does not exists.`);
    }
    return SherryResponseDto.mapFrom(sherry);
  }

  async createFileNames(sherryId: string, fileNames: string[]): Promise<FileName[]> {
    return Promise.all(
      (fileNames.map(async (name) => this.sherryRepository.createFileName({
        sherryId,
        name,
      }))),
    );
  }

  async recreateFileTypes(sherryId: string, fileTypes: string[]): Promise<FileType[]> {
    await this.sherryRepository.deleteFileTypes(sherryId);
    return this.createFileTypes(sherryId, fileTypes);
  }

  async recreateFileNames(sherryId: string, fileNames: string[]): Promise<FileName[]> {
    await this.sherryRepository.deleteFileNames(sherryId);
    return this.createFileNames(sherryId, fileNames);
  }

  async createFileTypes(sherryId: string, fileTypes: string[]): Promise<FileType[]> {
    return Promise.all(
      (fileTypes.map(async (type) => this.sherryRepository.createFileType({
        sherryId,
        type,
      }))),
    );
  }

  async update(
    userId: string,
    sherryId: string,
    data: UpdateSherryDto,
  ): Promise<SherryResponseDto> {
    const sherry = await this.sherryRepository.getById(userId, sherryId);
    if (!sherry) {
      throw new NotFoundException(`Sherry with id ${sherryId} does not exists.`);
    }
    await this.sherryRepository.update(sherryId, {
      name: data.name,
      maxFileSize: data.maxFileSize,
      maxDirSize: data.maxDirSize,
      allowDir: data.allowDir,
    });
    if (data.allowedFileNames && data.allowedFileNames.length > 0) {
      await this.recreateFileNames(sherryId, data.allowedFileNames);
    }
    if (data.allowedFileTypes && data.allowedFileTypes.length > 0) {
      await this.recreateFileTypes(sherryId, data.allowedFileTypes);
    }
    return this.getById(userId, sherryId);
  }
}
