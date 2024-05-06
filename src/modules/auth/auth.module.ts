import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { appConfig } from '@shared/configs';
import { PrismaService } from '@shared/services';
import { CryptoService } from '@shared/services/crypto.service';
import { JwtStrategy } from '@shared/strategies';

import { AuthController } from '@modules/auth/auth.controller';
import { AuthService } from '@modules/auth/auth.service';
import { UserModule } from '@modules/user/user.module';
import { UserRepository } from '@modules/user/user.repository';
import { UserService } from '@modules/user/user.service';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: appConfig.getAppSecret(),
      signOptions: { expiresIn: appConfig.getJwtExpired() },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, CryptoService, UserService, UserRepository, PrismaService, JwtStrategy],
})
export class AuthModule {}
