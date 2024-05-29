import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { PrismaService } from '@shared/services';

import { UserResponseDto } from '@modules/auth/dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async update(userId: string, data: Prisma.UserUpdateInput): Promise<User | null> {
    return this.prisma.user.update({
      where: { userId },
      data,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findUnique(data: Prisma.UserFindUniqueArgs): Promise<User | null> {
    return this.prisma.user.findUnique(data);
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findMany(data: Prisma.UserFindManyArgs): Promise<UserResponseDto[]> {
    return this.prisma.user.findMany(data)
      .then((users) => users
        .map((u) => UserResponseDto.mapFrom(u)));
  }
}
