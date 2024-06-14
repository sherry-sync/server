import { SherryFile } from '@prisma/client';
import { Expose, plainToClass } from 'class-transformer';

export class SherryFileDto {
  @Expose()
    sherryFileId: string;

  @Expose()
    size: number;

  @Expose()
    path: string;

  @Expose()
    oldPath: string;

  @Expose()
    hash: string;

  @Expose()
    fileType: string;

  @Expose()
    createdAt: number;

  @Expose()
    updatedAt: number;

  @Expose()
    sherryId: string;

  static mapFrom(data: SherryFile): SherryFileDto {
    return plainToClass(SherryFileDto, {
      ...data,
      createdAt: data.createdAt ? data.createdAt.getTime() : 0,
      updatedAt: data.updatedAt ? data.updatedAt.getTime() : 0,
    }, { excludeExtraneousValues: true });
  }

  static mapFromMulti(data: SherryFile[]): SherryFileDto[] {
    return data.map((element) => this.mapFrom(element));
  }
}
