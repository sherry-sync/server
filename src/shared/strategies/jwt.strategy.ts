import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { appConfig } from '@shared/configs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT]),
      ignoreExpiration: true,
      secretOrKey: appConfig.getAppSecret(),
    });
  }

  private static extractJWT(request: FastifyRequest): string | null {
    const token = request.headers.authorization;
    if (!token) {
      return '';
    }
    return token ? token.replace('Bearer ', '') : token;
  }

  async validate(payload: Record<string, string>): Promise<{ id: string; email: string }> {
    return { id: payload.id, email: payload.email };
  }
}
