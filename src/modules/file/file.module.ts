import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { appConfig } from '@shared/configs';
import { PrismaService } from '@shared/services';

import { EventService } from '@modules/event';
import { FileController } from '@modules/file/file.controller';
import { FileService } from '@modules/file/file.service';
import { SherryRepository } from '@modules/sherry/sherry.repository';
import { SherryService } from '@modules/sherry/sherry.service';

@Module({
  imports: [
    JwtModule.register({
      secret: appConfig.getAppSecret(),
      signOptions: { expiresIn: appConfig.getJwtExpired() },
    }),
  ],
  controllers: [FileController],
  providers: [FileService, PrismaService, SherryService, SherryRepository, EventService],
})
export class FileModule {}
