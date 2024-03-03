import 'dotenv/config';

import { defaultPort } from '@common/constants';

class AppConfig {
  constructor(private environment: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.environment[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value || '';
  }

  ensureValues(keys: string[]): AppConfig {
    // eslint-disable-next-line no-restricted-syntax
    for (const k of keys) this.getValue(k, true);
    return this;
  }

  getPepper(): string {
    return this.getValue('PEPPER', true);
  }

  getHost(): string {
    return this.getValue('HOST') || '0.0.0.0';
  }

  getConfirmUrl(): string {
    const clientUrl = this.getValue('CLIENT_URL', true);
    return `${clientUrl}/auth/verify`;
  }

  getPort(): string | number {
    return this.getValue('PORT') || defaultPort;
  }

  getFrontApiLink(): string {
    return this.getValue('FRONT_API_LINK');
  }

  getAppSecret(): string | undefined {
    return this.getValue('APP_SECRET', true);
  }

  getRefreshTokenSecret(): string {
    return this.getValue('REFRESH_TOKEN_SECRET', true);
  }

  getJwtExpired(): string | undefined {
    return this.getValue('JWT_EXPIRED', true);
  }

  // TODO uncomment after AWS configuration.
  // getAWSConfig(): never {
  //   return {
  //     accessKeyId: this.getValue('AWS_ACCESS_KEY_ID', true),
  //     secretAccessKey: this.getValue('AWS_SECRET_ACCESS_KEY', true),
  //     region: this.getValue('AWS_REGION', true),
  //   };
  // }
}

const appConfig = new AppConfig(process.env).ensureValues([
  'PORT',
  'HOST',
  'APP_SECRET',
  'JWT_EXPIRED',
  'REFRESH_TOKEN_SECRET',
]);

export { appConfig };
