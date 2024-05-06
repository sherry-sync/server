import { Module } from '@nestjs/common';

import { PrismaService } from '@shared/services';

import { SherryController } from '@modules/sherry/sherry.controller';
import { SherryRepository } from '@modules/sherry/sherry.repository';
import { SherryService } from '@modules/sherry/sherry.service';

@Module({
  controllers: [SherryController],
  providers: [SherryService, SherryRepository, PrismaService],
})
export class SherryModule {}
