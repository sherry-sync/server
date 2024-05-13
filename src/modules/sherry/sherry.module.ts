import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { appConfig } from '@shared/configs';
import { PrismaService } from '@shared/services';

import { EventService } from '@modules/event';
import { SherryController } from '@modules/sherry/sherry.controller';
import { SherryRepository } from '@modules/sherry/sherry.repository';
import { SherryService } from '@modules/sherry/sherry.service';

@Module({
  imports: [
    JwtModule.register({
      secret: appConfig.getAppSecret(),
      signOptions: { expiresIn: appConfig.getJwtExpired() },
    }),
  ],
  controllers: [SherryController],
  providers: [SherryService, SherryRepository, PrismaService, EventService],
})
export class SherryModule {}
