import * as fs from 'node:fs';

import {
  ConflictException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { EventTypes, FileEvents } from '@shared/enums';
import { CryptoService } from '@shared/services/crypto.service';
import { HttpUserPayload } from '@shared/types';

import { EventService } from '@modules/event';
import { FileEventDto } from '@modules/file/dto';
import { FileRepository } from '@modules/file/file.repository';
import { trimFileName } from '@modules/file/helpers';
import { File } from '@modules/file/types';
import { SherryService } from '@modules/sherry/sherry.service';

@Injectable()
export class FileService {
  private readonly baseFolder = 'uploads';

  constructor(
    private readonly sherryService: SherryService,
    private readonly eventService: EventService,
    private readonly fileRepository: FileRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async buildFilePath(sherryId: string, filename: string) {
    return `${__dirname}/../../../${this.baseFolder}/${sherryId}-${filename}`;
  }

  async storeFile(file: File, dto: FileEventDto, user: HttpUserPayload) {
    const { eventType, sherryId } = dto;
    const { userId } = user;
    if (!await this.sherryService.canInteractWithSherry(sherryId, userId)) {
      throw new ForbiddenException(`Access to sherry ${sherryId} not allowed`);
    }
    const userIds = await this.sherryService.getSherryUsers(sherryId);
    const userIdsExceptInitiator = userIds.filter((id) => id !== userId);

    const filePath = await this.buildFilePath(sherryId, file.originalname);

    switch (eventType) {
      case FileEvents.CREATED: {
        await this.saveFile(file, {
          sherryId,
          path: filePath,
          hash: this.cryptoService.getHash(file.buffer),
          size: file.buffer.toString().length,
          oldPath: '',
        });
        this.eventService.sendEvent(EventTypes.FILE_FILE_CREATED, userIdsExceptInitiator, {
          sherryId,
          filePath,
        });
        break;
      }
      case FileEvents.UPDATED: {
        await this.updateFile(file, sherryId);

        this.eventService.sendEvent(EventTypes.FILE_FILE_UPDATED, userIdsExceptInitiator, {
          sherryId,
          filePath,
        });
        break;
      }
      case FileEvents.DELETED: {
        await this.deleteFile(filePath);
        this.eventService.sendEvent(EventTypes.FILE_FILE_DELETED, userIdsExceptInitiator, {
          sherryId,
          filePath,
        });
        break;
      }
      default: {
        throw new NotFoundException(`Event type ${eventType} not supported`);
      }
    }
  }

  async deleteFile(filepath: string) {
    await this.fileRepository.deleteByPath(filepath);
    fs.unlinkSync(filepath);
  }

  async updateFile(file: File, sherryId: string) {
    const filePath = await this.buildFilePath(sherryId, file.originalname);

    const existingFile = await this.fileRepository.getByPath(filePath);
    if (!existingFile) {
      throw new NotFoundException(`File with path ${file.path} does not exist`);
    }

    if (existingFile && file.path !== existingFile.path) {
      await this.deleteFile(file.path);
    }

    await this.saveFile(file, {
      sherryId,
      path: filePath,
      hash: this.cryptoService.getHash(file.buffer),
      oldPath: trimFileName(this.baseFolder, existingFile.path),
      size: file.buffer.toString().length,
    });
  }

  async saveFile(file: File, data: Prisma.SherryFileUncheckedCreateInput) {
    const trimmedPath = trimFileName(this.baseFolder, data.path);
    const existingFile = await this.fileRepository.getByPath(trimmedPath);
    if (existingFile) {
      throw new ConflictException(`File with path ${trimmedPath} already exists`);
    }

    await this.fileRepository.create({
      ...data,
      path: trimmedPath,
    });
    fs.writeFileSync(data.path, file.buffer);
  }
}
