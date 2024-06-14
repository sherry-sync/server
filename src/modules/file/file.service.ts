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
import { FileEventDto, SherryFileDto, VerifyFileActionDto } from '@modules/file/dto';
import { FileRepository } from '@modules/file/file.repository';
import {
  CreateFileEvent,
  File,
  isCreateFileEvent,
  isMoveFileEvent,
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

  async verifyFileAction(user: HttpUserPayload, dto: VerifyFileActionDto) {
    const { userId } = user;
    if (!await this.sherryService.canInteractWithSherry(dto.sherryId, userId)) {
      throw new ForbiddenException(`Access to sherry ${dto.sherryId} not allowed`);
    }

    switch (dto.eventType) {
      case FileEvents.CREATED: {
        await this.verifyCreateAction(userId, dto);
        break;
      }
      case FileEvents.DELETED: {
        await this.verifyDeleteAction(userId, dto);
        break;
      }
      case FileEvents.MOVED: {
        await this.verifyMoveAction(userId, dto);
        break;
      }
      case FileEvents.UPDATED: {
        await this.verifyUpdateAction(userId, dto);
        break;
      }
      default: {
        throw new NotFoundException(`Event type ${dto.eventType} not supported`);
      }
    }
  }

  async verifyUpdateAction(userId: string, dto: VerifyFileActionDto) {
    const existingFile = await this.fileRepository.getByPathAndSherryId(dto.sherryId, dto.path);
    if (!existingFile) {
      throw new ConflictException(`File with path ${dto.path} does not exists`);
    }

    if (dto.hash === existingFile.hash) {
      throw new ConflictException('Hash does not changed');
    }

    await this.verifyFileRules(userId, dto);
  }

  async verifyMoveAction(userId: string, dto: VerifyFileActionDto) {
    if (dto.oldPath === dto.path) {
      throw new ConflictException('Old and new path cannot be the same');
    }
    const existingFile = await this.fileRepository.getByPathAndSherryId(dto.sherryId, dto.path);
    if (existingFile) {
      throw new ConflictException(`File with path ${dto.path} already exists`);
    }
    const fileInOldPath = await this.fileRepository.getByPathAndSherryId(dto.sherryId, dto.oldPath);
    if (!fileInOldPath) {
      throw new ConflictException(`File with path ${dto.oldPath} does not exists`);
    }
  }

  async verifyDeleteAction(userId: string, dto: VerifyFileActionDto) {
    if (!dto.path) {
      throw new BadRequestException('path is not provided');
    }
    const existingFile = await this.fileRepository.getByPathAndSherryId(dto.sherryId, dto.path);
    if (!existingFile) {
      throw new ConflictException(`File with path ${dto.path} does not exist`);
    }
  }

  async verifyFileRules(userId: string, dto: VerifyFileActionDto) {
    const sherry = await this.sherryService.getById(userId, dto.sherryId);
    const files = await this.getFilesBySherryId(sherry.sherryId, userId);
    const allFilesSize = files.reduce((accumulator, element) => accumulator + element.size, 0);
    if (dto.size && sherry.maxDirSize < allFilesSize + dto.size) {
      throw new ConflictException(`Sherry max dir size is ${sherry.maxDirSize}`);
    }
    if (dto.size > sherry.maxFileSize) {
      throw new ConflictException(`Sherry max file size is ${sherry.maxFileSize}`);
    }

    if (
      !dto.path
      // || !sherry.allowedFileNames.length
      // || !sherry.allowedFileNames.some(({ name }) => dto.path.match(name))
    ) {
      throw new ConflictException('filename should match sherry settings');
    }
  }

  async verifyCreateAction(userId: string, dto: VerifyFileActionDto) {
    if (!dto.path) {
      throw new BadRequestException('path is not provided');
    }
    const existingFile = await this.fileRepository.getByPathAndSherryId(dto.sherryId, dto.path);
    if (existingFile) {
      throw new ConflictException(`File with path ${dto.path} already exists`);
    }

    await this.verifyFileRules(userId, dto);
  }

  async getFilesBySherryId(sherryId: string, userId: string) {
    if (!await this.sherryService.canInteractWithSherry(sherryId, userId)) {
      throw new ForbiddenException(`Access to sherry ${sherryId} not allowed`);
    }
    const files = await this.fileRepository.getFilesBySherryId(sherryId);
    return SherryFileDto.mapFromMulti(files);
  }

  async getFileByPathAndSherryId(sherryId: string, path: string, user: HttpUserPayload) {
    const { userId } = user;
    if (!await this.sherryService.canInteractWithSherry(sherryId, userId)) {
      throw new ForbiddenException(`Access to sherry ${sherryId} not allowed`);
    }
    const file = await this.fileRepository.getByPathAndSherryId(sherryId, path);
    return file ? SherryFileDto.mapFrom(file) : null;
  }

  async getFileInstance(sherryId: string, filePath: string, user: HttpUserPayload) {
    const { userId } = user;
    if (!await this.sherryService.canInteractWithSherry(sherryId, userId)) {
      throw new ForbiddenException(`Access to sherry ${sherryId} not allowed`);
    }
    const file = await this.fileRepository.getByPathAndSherryId(sherryId, filePath);
    if (!file) {
      throw new NotFoundException(`File with path ${filePath} does not exists)`);
    }

    return fs.readFileSync(this.buildFilePath(sherryId, file.sherryFileId));
  }

  async storeFile(file: File, dto: FileEventDto, user: HttpUserPayload) {
    const {
      eventType,
      sherryId,
    } = dto;
    const { userId } = user;
    if (!await this.sherryService.canInteractWithSherry(sherryId, userId)) {
      throw new ForbiddenException(`Access to sherry ${sherryId} not allowed`);
    }
    const userIds = await this.sherryService.getSherryUsers(sherryId);

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

        this.eventService.sendEvent(
          EventTypes.FILE_FILE_CREATED,
          userIds,
          SherryFileDto.mapFrom(savedFile),
        );
        break;
      }
      case FileEvents.UPDATED: {
        if (!isUpdateFileEvent(dto) || !file) {
          throw new BadRequestException('File event not processable');
        }
        const updatedFile = await this.updateFile(file, dto);

        this.eventService.sendEvent(
          EventTypes.FILE_FILE_UPDATED,
          userIds,
          SherryFileDto.mapFrom(updatedFile),
        );
        break;
      }
      case FileEvents.DELETED: {
        const deletedFile = await this.deleteFile(sherryId, dto.path);
        this.eventService.sendEvent(
          EventTypes.FILE_FILE_DELETED,
          userIds,
          SherryFileDto.mapFrom(deletedFile),
        );
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
        this.eventService.sendEvent(
          EventTypes.FILE_FILE_MOVED,
          userIds,
          SherryFileDto.mapFrom(movedFile),
        );
        break;
      }
      default: {
        throw new NotFoundException(`Event type ${eventType} not supported`);
      }
    }
  }

  async moveFile(sherryId: string, filePath: string, oldPath: string) {
    const savedFile = await this.fileRepository.getByPathAndSherryId(sherryId, oldPath);
    if (!savedFile) {
      throw new NotFoundException(`File with path ${oldPath} does not exists`);
    }
    return this.fileRepository.update(oldPath, {
      path: filePath,
      oldPath,
    });
  }

  async deleteFile(sherryId: string, filePath: string) {
    const savedFile = await this.fileRepository.getByPathAndSherryId(sherryId, filePath);
    if (!savedFile) {
      throw new NotFoundException(`File with path ${filePath} does not exists`);
    }
    await this.fileRepository.deleteByPath(savedFile.path);
    fs.unlinkSync(this.buildFilePath(sherryId, savedFile.sherryFileId));
    return savedFile;
  }

  async updateFile(file: File, data: UpdateFileEvent | CreateFileEvent) {
    const existingFile = await this.fileRepository.getByPathAndSherryId(data.sherryId, data.path);
    if (!existingFile) {
      throw new NotFoundException(`File with path ${file.path} does not exist`);
    }
    if (existingFile.hash === data.hash) {
      throw new ConflictException('Hash not changed');
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
    const existingFile = await this.fileRepository.getByPathAndSherryId(data.sherryId, data.path);
    if (existingFile) {
      throw new ConflictException(`File with path ${data.path} already exists`);
    }

    const savedFile = await this.fileRepository.create(data);
    const createdPath = this.buildFilePath(savedFile.sherryId, savedFile.sherryFileId);
    fs.writeFileSync(createdPath, file.buffer);
    return savedFile;
  }
}
