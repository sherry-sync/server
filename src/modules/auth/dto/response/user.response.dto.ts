import { User } from '@prisma/client';
import { Expose, plainToClass } from 'class-transformer';

export class UserResponseDto {
  @Expose()
    id: string;

  @Expose()
    email: string;

  @Expose()
    username: string;

  @Expose()
    isEmailConfirmed: boolean;

  static mapFrom(data: User): UserResponseDto {
    return plainToClass(UserResponseDto, data, { excludeExtraneousValues: true });
  }
}
