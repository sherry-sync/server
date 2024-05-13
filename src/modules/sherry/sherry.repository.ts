import { Injectable } from '@nestjs/common';
import {
  FileName, FileType, Prisma, Sherry, SherryPermission,
} from '@prisma/client';

import { PrismaService } from '@shared/services';

@Injectable()
export class SherryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createRole(data: Prisma.SherryPermissionUncheckedCreateInput): Promise<SherryPermission> {
    return this.prisma.sherryPermission.create({
      data,
    });
  }

  async deleteRole(sherryPermissionId: string): Promise<SherryPermission> {
    return this.prisma.sherryPermission.delete({
      where: { sherryPermissionId },
    });
  }

  async getAllByUserId(userId: string): Promise<Sherry[]> {
    return this.prisma.sherry.findMany({
      where: { userId },
      include: {
        allowedFileNames: true,
        allowedFileTypes: true,
      },
    });
  }

  async update(sherryId: string, data: Prisma.SherryUncheckedUpdateInput): Promise<Sherry> {
    return this.prisma.sherry.update({
      where: { sherryId },
      data,
    });
  }

  async getById(userId: string, sherryId: string): Promise<Prisma.SherryGetPayload<{
    include: {
      allowedFileNames: true,
      allowedFileTypes: true,
      sherryPermission: true,
    }
  }> | null> {
    return this.prisma.sherry.findUnique({
      where: { userId, sherryId },
      include: {
        allowedFileNames: true,
        allowedFileTypes: true,
        sherryPermission: true,
      },
    });
  }

  async create(data: Prisma.SherryUncheckedCreateInput): Promise<Sherry> {
    return this.prisma.sherry.create({
      data,
    });
  }

  async createFileType(data: Prisma.FileTypeUncheckedCreateInput): Promise<FileType> {
    return this.prisma.fileType.create({
      data,
    });
  }

  async deleteFileTypes(sherryId: string): Promise<boolean> {
    await this.prisma.fileType.deleteMany({
      where: { sherryId },
    });
    return true;
  }

  async deleteFileNames(sherryId: string): Promise<boolean> {
    await this.prisma.fileName.deleteMany({
      where: { sherryId },
    });
    return true;
  }

  async createFileName(data: Prisma.FileNameUncheckedCreateInput): Promise<FileName> {
    return this.prisma.fileName.create({
      data,
    });
  }
}
