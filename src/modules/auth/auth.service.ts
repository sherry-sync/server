import {
  Injectable, NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtVerifyOptions } from '@nestjs/jwt/dist/interfaces';

import { appConfig } from '@shared/configs';
import { CryptoService } from '@shared/services/crypto.service';

import {
  SignInRequestDto, SignInResponseDto, SignUpRequestDto, UserResponseDto,
} from '@modules/auth/dto';
import { UserService } from '@modules/user/user.service';

import { emailTokenExpiresAt } from '@common/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async registration(dto: SignUpRequestDto): Promise<UserResponseDto> {
    const hashedPassword = await this.cryptoService.encryptString(dto.password);
    const user = await this.userService.create({ ...dto, password: hashedPassword });

    return UserResponseDto.mapFrom(user);
  }

  async login(dto: SignInRequestDto): Promise<SignInResponseDto> {
    const user = await this.userService.getByEmailWithCompany(dto.email);
    if (!user) {
      throw new NotFoundException(`User with email ${dto.email} does not exist`);
    }
    if (!user.isEmailConfirmed) {
      throw new UnauthorizedException('Email unconfirmed');
    }

    const isPasswordEq = await this.cryptoService.verifyString(dto.password, user.password);
    if (!isPasswordEq) {
      throw new UnauthorizedException('Wrong email or password');
    }

    const accessToken = await this.getJwtToken(user.id);
    const refreshToken = await this.getRefreshJwtToken(user.id);
    return SignInResponseDto.mapFrom({
      ...user, accessToken, refreshToken, company: user.company,
    });
  }

  async regenerateTokens(refreshToken: string): Promise<SignInResponseDto> {
    const refreshSecret = appConfig.getRefreshTokenSecret();
    const { id } = this.verifyToken(refreshToken, { secret: refreshSecret });
    const user = await this.userService.getById(id);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.getJwtToken(id);
    const newRefreshToken = await this.getRefreshJwtToken(id);

    return SignInResponseDto.mapFrom({ ...user, accessToken, refreshToken: newRefreshToken });
  }

  async getEmailConfirmationJwt(email: string): Promise<string> {
    return this.jwtService.signAsync({ email }, { expiresIn: emailTokenExpiresAt });
  }

  verifyToken(token: string, options?: JwtVerifyOptions): any {
    let payload;
    try {
      payload = this.jwtService.verify(token, options);
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

  async getJwtToken(id: string): Promise<string> {
    return this.jwtService.signAsync({ id });
  }

  async getRefreshJwtToken(id: string): Promise<string> {
    const refreshSecret = appConfig.getRefreshTokenSecret();
    const refreshToken = await this.jwtService.signAsync({ id }, { secret: refreshSecret });
    await this.userService.updateById(id, { refreshToken });
    return refreshToken;
  }
}
