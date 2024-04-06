import { User } from '@prisma/client';
import { Expose, plainToClass } from 'class-transformer';

export class UserResponseDto {
  @Expose()
    userId: string;

  @Expose()
    email: string;

  @Expose()
    username: string;

  static mapFrom(data: User): UserResponseDto {
    return plainToClass(UserResponseDto, data, { excludeExtraneousValues: true });
  }
}
