import {
  Body, Controller, HttpCode, HttpStatus, Post,
} from '@nestjs/common';

import { AuthService } from '@modules/auth/auth.service';
import {
  RefreshRequestDto,
  SignInRequestDto,
  SignInResponseDto,
  SignUpRequestDto,
  UserResponseDto,
} from '@modules/auth/dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async register(@Body() signUpDto: SignUpRequestDto): Promise<UserResponseDto> {
    return this.authService.registration(signUpDto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async login(@Body() signInDto: SignInRequestDto): Promise<SignInResponseDto> {
    return this.authService.login(signInDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshDto: RefreshRequestDto): Promise<SignInResponseDto> {
    return this.authService.regenerateTokens(refreshDto.refreshToken);
  }
}
