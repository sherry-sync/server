import { IsEnum, IsUUID } from 'class-validator';

import { FileEvents } from '@shared/enums';

export class FileEventDto {
  @IsEnum(FileEvents)
    eventType: FileEvents;

  @IsUUID()
    sherryId: string;
}
