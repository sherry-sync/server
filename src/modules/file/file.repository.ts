import { Injectable } from '@nestjs/common';
import { Prisma, SherryFile } from '@prisma/client';

import { PrismaService } from '@shared/services';

@Injectable()
export class FileRepository {
  constructor(private readonly prisma: PrismaService) {}

  deleteByPath(path: string): Promise<SherryFile> {
    return this.prisma.sherryFile.delete({ where: { path } });
  }

  getFilesBySherryId(sherryId: string) {
    return this.prisma.sherryFile.findMany({
      where: { sherryId },
    });
  }

  getByPathAndSherryId(sherryId: string, path: string) {
    return this.prisma.sherryFile.findFirst({
      where: { path, sherryId },
    });
  }

  create(data: Prisma.SherryFileUncheckedCreateInput): Promise<SherryFile> {
    return this.prisma.sherryFile.create({ data });
  }

  update(path: string, data: Prisma.SherryFileUpdateInput): Promise<SherryFile | null> {
    return this.prisma.sherryFile.update({
      where: { path },
      data,
    });
  }
}
