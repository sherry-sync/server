import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { appConfig } from '@shared/configs';
import { CryptoService } from '@shared/services/crypto.service';
import { EmailService } from '@shared/services/email.service';
import { JwtStrategy } from '@shared/strategies';

import { AuthController } from '@modules/auth/auth.controller';
import { AuthService } from '@modules/auth/auth.service';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: appConfig.getAppSecret(),
      signOptions: { expiresIn: appConfig.getJwtExpired() },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, CryptoService, JwtStrategy, EmailService],
})
export class AuthModule {}
