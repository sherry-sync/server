import { Sherry } from '@prisma/client';
import { Expose, plainToClass } from 'class-transformer';

import { FileNameResponseDto, FileTypeResponseDto } from '@modules/sherry/dto/response';

export class SherryResponseDto {
  @Expose()
    sherryId: string;

  @Expose()
    name: string;

  @Expose()
    maxFileSize: number;

  @Expose()
    userId: string;

  @Expose()
    maxDirSize: number;

  @Expose()
    allowedFileTypes: FileTypeResponseDto;

  @Expose()
    allowedFileNames: FileNameResponseDto;

  static mapFrom(data: Sherry): SherryResponseDto {
    return plainToClass(SherryResponseDto, data, { excludeExtraneousValues: true });
  }

  static mapFromMulti(data: Sherry[]): SherryResponseDto[] {
    return data.map((element) => this.mapFrom(element));
  }
}
