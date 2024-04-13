import { User } from '@prisma/client';
import { Expose, plainToClass } from 'class-transformer';

import { TokenPair } from '@modules/auth/types';

export class SignInResponseDto {
  @Expose()
    userId: string;

  @Expose()
    email: string;

  @Expose()
    username: string;

  @Expose()
    accessToken: string;

  @Expose()
    refreshToken: string;

  static mapFrom(data: User & TokenPair): SignInResponseDto {
    return plainToClass(SignInResponseDto, data, { excludeExtraneousValues: true });
  }
}
