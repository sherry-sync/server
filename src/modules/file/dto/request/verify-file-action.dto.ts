import {
  IsEnum, IsNumber, IsOptional, IsString, IsUUID,
} from 'class-validator';

import { FileEvents } from '@shared/enums';

export class VerifyFileActionDto {
  @IsEnum(FileEvents)
    eventType: FileEvents;

  @IsUUID()
    sherryId: string;

  @IsOptional()
  @IsString()
    fileType: string;

  @IsNumber()
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
