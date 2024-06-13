import * as fs from 'node:fs';

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { EventTypes, FileEvents } from '@shared/enums';
import { HttpUserPayload } from '@shared/types';

import { EventService } from '@modules/event';
import { FileEventDto } from '@modules/file/dto';
import { FileRepository } from '@modules/file/file.repository';
import {
  CreateFileEvent,
  File,
  isCreateFileEvent, isMoveFileEvent,
  isUpdateFileEvent,
  UpdateFileEvent,
} from '@modules/file/types';
import { SherryService } from '@modules/sherry/sherry.service';

@Injectable()
export class FileService {
  private readonly baseFolder = 'uploads';

  constructor(
    private readonly sherryService: SherryService,
    private readonly eventService: EventService,
    private readonly fileRepository: FileRepository,
  ) {}

  buildFilePath(sherryId: string, fileId: string) {
    return `${this.baseFolder}/${sherryId}-${fileId}`;
  }

  async storeFile(file: File, dto: FileEventDto, user: HttpUserPayload) {
    const { eventType, sherryId } = dto;
    const { userId } = user;
    if (!await this.sherryService.canInteractWithSherry(sherryId, userId)) {
      throw new ForbiddenException(`Access to sherry ${sherryId} not allowed`);
    }
    const userIds = await this.sherryService.getSherryUsers(sherryId);
    const userIdsExceptInitiator = userIds.filter((id) => id !== userId);

    switch (eventType) {
      case FileEvents.CREATED: {
        if (!isCreateFileEvent(dto) || !file) {
          throw new BadRequestException('File event not processable');
        }
        const savedFile = await this.saveFile(file, {
          sherryId,
          fileType: dto.fileType,
          path: dto.path,
          hash: dto.hash,
          size: dto.size,
          oldPath: dto.oldPath || '',
        });
        this.eventService.sendEvent(EventTypes.FILE_FILE_CREATED, userIdsExceptInitiator, {
          sherryId,
          filePath: savedFile.path,
        });
        break;
      }
      case FileEvents.UPDATED: {
        if (!isUpdateFileEvent(dto) || !file) {
          throw new BadRequestException('File event not processable');
        }
        const updatedFile = await this.updateFile(file, dto);

        this.eventService.sendEvent(EventTypes.FILE_FILE_UPDATED, userIdsExceptInitiator, {
          sherryId,
          filePath: updatedFile.path,
        });
        break;
      }
      case FileEvents.DELETED: {
        const deletedFile = await this.deleteFile(sherryId, dto.path);
        this.eventService.sendEvent(EventTypes.FILE_FILE_DELETED, userIdsExceptInitiator, {
          sherryId,
          filePath: deletedFile.path,
        });
        break;
      }
      case FileEvents.MOVED: {
        if (!isMoveFileEvent(dto)) {
          throw new BadRequestException('File event not processable');
        }
        const movedFile = await this.moveFile(sherryId, dto.path, dto.oldPath);
        if (!movedFile) {
          throw new ConflictException('File rename failed');
        }
        this.eventService.sendEvent(EventTypes.FILE_FILE_MOVED, userIdsExceptInitiator, {
          sherryId,
          filePath: movedFile.path,
          oldPath: movedFile.oldPath,
        });
        break;
      }
      default: {
        throw new NotFoundException(`Event type ${eventType} not supported`);
      }
    }
  }

  async moveFile(sherryId: string, filePath: string, oldPath: string) {
    const savedFile = await this.fileRepository.getByPath(oldPath);
    if (!savedFile) {
      throw new NotFoundException(`File with path ${oldPath} does not exists`);
    }
    return this.fileRepository.update(oldPath, {
      path: filePath,
      oldPath,
    });
  }

  async deleteFile(sherryId: string, filePath: string) {
    const savedFile = await this.fileRepository.getByPath(filePath);
    if (!savedFile) {
      throw new NotFoundException(`File with path ${filePath} does not exists`);
    }
    await this.fileRepository.deleteByPath(savedFile.path);
    fs.unlinkSync(this.buildFilePath(sherryId, savedFile.sherryFileId));
    return savedFile;
  }

  async updateFile(file: File, data: UpdateFileEvent | CreateFileEvent) {
    const existingFile = await this.fileRepository.getByPath(data.path);
    if (!existingFile) {
      throw new NotFoundException(`File with path ${file.path} does not exist`);
    }

    const builtFilePath = this.buildFilePath(existingFile.sherryId, existingFile.sherryFileId);
    fs.unlinkSync(builtFilePath);
    fs.writeFileSync(builtFilePath, file.buffer);

    const updatedFile = await this.fileRepository.update(existingFile.path, {
      fileType: data.fileType,
      path: data.path,
      hash: data.hash,
      size: data.size,
    });
    if (!updatedFile) {
      throw new ConflictException('File update failed ');
    }
    return updatedFile;
  }

  async saveFile(file: File, data: Prisma.SherryFileUncheckedCreateInput) {
    const existingFile = await this.fileRepository.getByPath(data.path);
    if (existingFile) {
      throw new ConflictException(`File with path ${data.path} already exists`);
    }

    const savedFile = await this.fileRepository.create(data);
    const createdPath = this.buildFilePath(savedFile.sherryId, savedFile.sherryFileId);
    fs.writeFileSync(createdPath, file.buffer);
    return savedFile;
  }
}
