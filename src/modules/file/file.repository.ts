import * as path from 'node:path';

import { Injectable } from '@nestjs/common';
import { Prisma, SherryFile } from '@prisma/client';

import { PrismaService } from '@shared/services';

@Injectable()
export class FileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async deleteByPath(syncPath: string): Promise<SherryFile | null> {
    await this.prisma.sherryFile.deleteMany({
      where: {
        path: {
          startsWith: path.normalize(`${syncPath}/`),
        },
      },
    });
    return this.prisma.sherryFile.delete({ where: { path: syncPath } }).catch(() => null);
  }

  getFilesBySherryId(sherryId: string) {
    return this.prisma.sherryFile.findMany({
      where: { sherryId },
    });
  }

  getByPathAndSherryId(sherryId: string, syncPath: string) {
    return this.prisma.sherryFile.findFirst({
      where: { path: syncPath, sherryId },
    });
  }

  create(data: Prisma.SherryFileUncheckedCreateInput): Promise<SherryFile> {
    return this.prisma.sherryFile.create({ data });
  }

  update(syncPath: string, data: Prisma.SherryFileUpdateInput): Promise<SherryFile | null> {
    return this.prisma.sherryFile.update({
      where: { path: syncPath },
      data,
    });
  }
}
