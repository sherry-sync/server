import {
  ConflictException,
  Injectable, NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtVerifyOptions } from '@nestjs/jwt/dist/interfaces';

import { appConfig } from '@shared/configs';
import { CryptoService } from '@shared/services/crypto.service';
import { HttpUserPayload } from '@shared/types';

import {
  SignInRequestDto, SignInResponseDto, SignUpRequestDto, UserResponseDto,
} from '@modules/auth/dto';
import { UserService } from '@modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async registration(dto: SignUpRequestDto): Promise<UserResponseDto> {
    const hashedPassword = await this.cryptoService.encryptString(dto.password);
    const existingUser = await this.userService.getByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    const user = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });

    return UserResponseDto.mapFrom(user);
  }

  async login(dto: SignInRequestDto): Promise<SignInResponseDto> {
    const user = await this.userService.getByEmail(dto.email);
    if (!user) {
      throw new NotFoundException(`User with email ${dto.email} does not exist`);
    }

    const isPasswordEq = await this.cryptoService.verifyString(dto.password, user.password);
    if (!isPasswordEq) {
      throw new UnauthorizedException('Wrong email or password');
    }

    const accessToken = await this.getJwtToken(user.userId);
    const refreshToken = await this.getRefreshJwtToken(user.userId);
    return SignInResponseDto.mapFrom({
      ...user,
      accessToken,
      refreshToken,
      expiresIn: this.jwtService.decode(accessToken).exp,
    });
  }

  async regenerateTokens(refreshToken: string): Promise<SignInResponseDto> {
    const refreshSecret = appConfig.getRefreshTokenSecret();
    const { userId } = this.verifyToken(refreshToken, { secret: refreshSecret });
    const user = await this.userService.getById(userId);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.getJwtToken(userId);
    const newRefreshToken = await this.getRefreshJwtToken(userId);

    return SignInResponseDto.mapFrom({
      ...user,
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: this.jwtService.decode(accessToken).exp,
    });
  }

  verifyToken(token: string, options?: JwtVerifyOptions): HttpUserPayload {
    let payload;
    try {
      payload = this.jwtService.verify<HttpUserPayload>(token, options);
    } catch (error) {
      if (error.message === 'jwt expired') {
        throw new UnauthorizedException('Jwt expired');
      }
      if (error.message === 'invalid token') {
        throw new UnauthorizedException('Invalid token');
      }
      throw new Error(error);
    }

    return payload;
  }

  async getJwtToken(userId: string): Promise<string> {
    return this.jwtService.signAsync({ userId });
  }

  async getRefreshJwtToken(userId: string): Promise<string> {
    const refreshSecret = appConfig.getRefreshTokenSecret();
    const refreshToken = await this.jwtService.signAsync({ userId }, { secret: refreshSecret });
    await this.userService.update(userId, { refreshToken });
    return refreshToken;
  }
}
