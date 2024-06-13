import {
  IsEnum, IsOptional, IsString, IsUUID,
} from 'class-validator';

import { FileEvents } from '@shared/enums';

export class FileEventDto {
  @IsEnum(FileEvents)
    eventType: FileEvents;

  @IsUUID()
    sherryId: string;

  @IsOptional()
  @IsString()
    fileType: string;

  @IsString()
  @IsOptional()
    size: number;

  @IsString()
  @IsOptional()
    path: string;

  @IsString()
  @IsOptional()
    oldPath: string;

  @IsString()
  @IsOptional()
    hash: string;
}
