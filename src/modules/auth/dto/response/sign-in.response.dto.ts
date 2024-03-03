import { Expose, plainToClass } from 'class-transformer';
import { UserCompanyWithTokensType } from '@shared/types';
import { Company } from '@prisma/client';
import { Optional } from '@nestjs/common';

export class SignInResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  isEmailConfirmed: boolean;

  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Expose()
  @Optional()
  company?: Company;

  static mapFrom(data: UserCompanyWithTokensType): SignInResponseDto {
    return plainToClass(SignInResponseDto, data, { excludeExtraneousValues: true });
  }
}
