import {
  IsDefined, IsEmail, IsNotEmpty, Matches, MinLength,
} from 'class-validator';

import { minLengthPasswordValidation, minLengthUsernameValidation, passwordMatchPattern } from '@common/constants';

export class SignUpRequestDto {
  @IsEmail()
  @IsDefined()
  readonly email: string;

  @IsNotEmpty()
  @MinLength(minLengthUsernameValidation)
  readonly username: string;

  @IsNotEmpty()
  @MinLength(minLengthPasswordValidation)
  @Matches(passwordMatchPattern, { message: 'Password should contain at least 1 number and 1 capital letter.' })
    password: string;
}
