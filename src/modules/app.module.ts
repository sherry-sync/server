import { Module } from '@nestjs/common';

import { PrismaService } from '@shared/services';

import { AuthModule } from '@modules/auth/auth.module';
import { EventModule } from '@modules/event';
import { FileModule } from '@modules/file';
import { SherryModule } from '@modules/sherry/sherry.module';

@Module({
  imports: [AuthModule, SherryModule, EventModule, FileModule],
  providers: [PrismaService],
})
export class AppModule {}
