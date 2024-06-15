import { Optional } from '@nestjs/common';
import {
  IsArray, IsBoolean, IsInt, IsOptional, IsPositive, IsString,
} from 'class-validator';

import {
  defaultMaxDirectorySize,
  defaultMaxFileSize,
  isDirectoryAllowed,
} from '@common/constants';

export class UpdateSherryDto {
  @IsString()
  @IsOptional()
    name: string;

  @IsPositive()
  @IsInt()
    maxFileSize = defaultMaxFileSize;

  @IsPositive()
  @IsInt()
    maxDirSize = defaultMaxDirectorySize;

  @IsBoolean()
    allowDir = isDirectoryAllowed;

  @Optional()
  @IsArray()
  @IsString({ each: true })
    allowedFileNames: string[];

  @Optional()
  @IsArray()
  @IsString({ each: true })
    allowedFileTypes: string[];
}
