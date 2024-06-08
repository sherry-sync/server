import * as fs from 'node:fs';

import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { EventTypes, FileEvents } from '@shared/enums';
import { HttpUserPayload } from '@shared/types';

import { EventService } from '@modules/event';
import { FileEventDto } from '@modules/file/dto';
import { File } from '@modules/file/types';
import { SherryService } from '@modules/sherry/sherry.service';

@Injectable()
export class FileService {
  constructor(
    private readonly sherryService: SherryService,
    private readonly eventService: EventService,
  ) {}

  async buildFilePath(sherryId: string, filename: string) {
    return `${__dirname}/../../../uploads/${sherryId}-${filename}`;
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
        this.saveFile(file, filePath);
        this.eventService.sendEvent(EventTypes.FILE_FILE_CREATED, userIdsExceptInitiator, {
          sherryId,
          filePath,
        });
        break;
      }
      case FileEvents.UPDATED: {
        this.saveFile(file, filePath);
        this.eventService.sendEvent(EventTypes.FILE_FILE_UPDATED, userIdsExceptInitiator, {
          sherryId,
          filePath,
        });
        break;
      }
      case FileEvents.DELETED: {
        this.deleteFile(filePath);
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

  deleteFile(filepath: string) {
    fs.unlinkSync(filepath);
  }

  saveFile(file: File, filePath: string) {
    fs.writeFileSync(filePath, file.buffer);
  }
}
