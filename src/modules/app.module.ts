import { Module } from '@nestjs/common';

import { PrismaService } from '@shared/services';

import { AuthModule } from '@modules/auth/auth.module';
import { SherryModule } from '@modules/sherry/sherry.module';

@Module({
  imports: [AuthModule, SherryModule],
  providers: [PrismaService],
})
export class AppModule {}
