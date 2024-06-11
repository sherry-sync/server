import * as crypto from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { appConfig } from '@shared/configs';

import { cryptoDigest, cryptoIterations, cryptoKeylen } from '@common/constants/';

@Injectable()
export class CryptoService {
  private BYTES_LEN = 16;

  private ENCODING: BufferEncoding = 'hex';

  getHash(buff: Buffer): string {
    const hash = crypto.createHash('sha256');
    hash.update(buff);
    return hash.digest('base64');
  }

  async encryptString(password: string): Promise<string> {
    const salt = crypto.randomBytes(this.BYTES_LEN).toString(this.ENCODING);
    const pepper = appConfig.getPepper();
    const hash = crypto
      .pbkdf2Sync(password, salt + pepper, cryptoIterations, cryptoKeylen, cryptoDigest)
      .toString(this.ENCODING);
    return `${salt}:${hash}`;
  }

  async verifyString(password: string, encryptedPassword: string): Promise<boolean> {
    const [salt, hash] = encryptedPassword.split(':');
    const pepper = appConfig.getPepper();
    const possibleHash = crypto
      .pbkdf2Sync(password, salt + pepper, cryptoIterations, cryptoKeylen, cryptoDigest)
      .toString(this.ENCODING);
    return hash === possibleHash;
  }
}
