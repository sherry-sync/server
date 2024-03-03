import { Module } from '@nestjs/common';

import { PrismaService } from '@shared/services';

import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [PrismaService],
})
export class AppModule {}
