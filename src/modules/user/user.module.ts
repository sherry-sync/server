import { Module } from '@nestjs/common';

import { PrismaService } from '@shared/services';

import { UserController } from '@modules/user/user.controller';

import { UserRepository } from './user.repository.js';
import { UserService } from './user.service.js';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, PrismaService],
  exports: [UserService],
})
export class UserModule {}
