import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { UserResponseDto } from '@modules/auth/dto';
import { PatchMeRequestDto } from '@modules/user/dto';

import { UserRepository } from './user.repository.js';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async patchMe(userId: string, dto: PatchMeRequestDto) {
    const updatedUser = await this.update(userId, dto);
    if (!updatedUser) {
      throw new NotFoundException(`User with id ${userId} does not exist`);
    }
    return UserResponseDto.mapFrom(updatedUser);
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.getById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} does not exist`);
    }
    return UserResponseDto.mapFrom(user);
  }

  async update(userId: string, data: Prisma.UserUpdateInput): Promise<User | null> {
    return this.userRepository.update(userId, data);
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.userRepository.createUser(data);
  }

  async getById(userId: string): Promise<User | null> {
    return this.userRepository.findUnique({
      where: { userId },
    });
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.userRepository.findUnique({
      where: { email },
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
