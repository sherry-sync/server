import {
  ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import {
  FileName, FileType, SherryRole,
} from '@prisma/client';

import { EventTypes, SherryPermissionAction } from '@shared/enums';

import { EventService } from '@modules/event';
import { CreateSherryDto, UpdateSherryDto, UpdateSherryPermissionDto } from '@modules/sherry/dto/request';
import { SherryResponseDto } from '@modules/sherry/dto/response';
import { SherryRepository } from '@modules/sherry/sherry.repository';

@Injectable()
export class SherryService {
  constructor(
    private readonly sherryRepository: SherryRepository,
    private readonly eventService: EventService,
  ) {}

  async delete(
    userId: string,
    sherryId: string,
  ) {
    const sherry = await this.sherryRepository.getById(sherryId, userId);
    if (!sherry) {
      throw new NotFoundException(`Sherry with id ${sherryId} does not exists.`);
    }

    const permission = await this.sherryRepository.getPermissionBySherryId(
      sherryId,
      userId,
      [SherryRole.OWNER],
    );

    if (!permission) {
      throw new ForbiddenException('User should have owner permission to delete sherry.');
    }
    await this.sherryRepository.delete(sherry.sherryId);

    const sherryUserIds = sherry.sherryPermission.map(
      (sherryPermission) => sherryPermission.userId,
    );

    this.eventService.sendEvent(EventTypes.FOLDER_DELETED, sherryUserIds, sherry);
    return sherry;
  }

  async canInteractWithSherry(
    sherryId: string,
    userId: string,
    roles: SherryRole[],
  ): Promise<boolean> {
    const permission = await this.sherryRepository.getPermissionBySherryId(sherryId, userId, roles);
    return !!permission;
  }

  async getSherryUsers(sherryId: string): Promise<string[]> {
    const sherry = await this.sherryRepository.getById(sherryId);
    if (!sherry) {
      throw new NotFoundException(`Sherry with id ${sherryId} does not exists.`);
    }
    return sherry.sherryPermission.map((perm) => perm.userId);
  }

  async updatePermission(
    ownerId: string,
    sherryId: string,
    userId: string,
    data: UpdateSherryPermissionDto,
  ) {
    const sherry = await this.sherryRepository.getById(sherryId, ownerId);
    if (!sherry) {
      throw new NotFoundException(`Sherry with id ${sherryId} does not exists.`);
    }

    if (data.action === SherryPermissionAction.GRANT) {
      const existingPermission = sherry.sherryPermission.find((perm) => perm.userId === userId);
      if (existingPermission) {
        await this.sherryRepository.deleteRole(existingPermission.sherryPermissionId);
      }
      const permission = await this.sherryRepository.createRole({
        sherryId,
        userId,
        role: data.role,
      });
      this.eventService.sendEvent(EventTypes.FOLDER_PERMISSION_GRANTED, [userId], permission);
      return permission;
    }
    const permission = sherry.sherryPermission.find((perm) => perm.userId === userId);
    if (!permission) {
      throw new NotFoundException(`Role for user ${userId} does not exist`);
    }
    this.eventService.sendEvent(EventTypes.FOLDER_PERMISSION_REVOKED, [userId], permission);
    return this.sherryRepository.deleteRole(permission.sherryPermissionId);
  }

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

    await this.sherryRepository.createRole({
      sherryId: sherry.sherryId,
      userId,
      role: SherryRole.OWNER,
    });

    const folder = await this.getById(userId, sherry.sherryId);
    this.eventService.sendEvent(EventTypes.FOLDER_CREATED, [userId], folder);
    return folder;
  }

  async getById(userId: string, sherryId: string): Promise<SherryResponseDto> {
    const sherry = await this.sherryRepository.getById(sherryId, userId);
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
    const sherry = await this.sherryRepository.getById(sherryId, userId);
    if (!sherry) {
      throw new NotFoundException(`Sherry with id ${sherryId} does not exists.`);
    }
    await this.sherryRepository.update(sherryId, {
      name: data.name,
      maxFileSize: data.maxFileSize,
      maxDirSize: data.maxDirSize,
      allowDir: data.allowDir,
    });
    if (data.allowedFileNames) {
      await this.recreateFileNames(sherryId, data.allowedFileNames);
    }
    if (data.allowedFileTypes) {
      await this.recreateFileTypes(sherryId, data.allowedFileTypes);
    }

    const folder = await this.getById(userId, sherryId);
    this.eventService.sendEvent(EventTypes.FOLDER_UPDATED, [userId], folder);
    return folder;
  }
}
