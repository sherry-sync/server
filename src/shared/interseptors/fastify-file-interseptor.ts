/* eslint-disable */
import {
  CallHandler, ExecutionContext, Inject, mixin, NestInterceptor, Optional, Type,
} from '@nestjs/common';
import FastifyMulter from 'fastify-multer';
import { diskStorage, Multer, Options } from 'multer';
import { Observable } from 'rxjs';
import { extname } from 'node:path';
export function FastifyFileInterceptor(
  fieldName: string,
  localOptions: Options,
): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    protected multer: MulterInstance;

    constructor(
    @Optional()
    @Inject('MULTER_MODULE_OPTIONS')
      options: Multer,
    ) {
      this.multer = (FastifyMulter as any)({ ...options, ...localOptions });
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const context_ = context.switchToHttp();

      await new Promise<void>((resolve, reject) => this.multer.single(fieldName)(context_.getRequest(), context_.getResponse(), (error: any) => {
        if (error) {
          return reject(error);
        }
        resolve();
      }));

      return next.handle();
    }
  }
  const Interceptor = mixin(MixinInterceptor);
  return Interceptor as Type<NestInterceptor>;
}
export const editFileName = (request: Request, file: any, callback: any): void => {
  const name = file.originalname.split('.')[0];
  const fileExtensionName = extname(file.originalname);
  const randomName = Array.from({ length: 4 })
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtensionName}`);
};


export function SingleFileInterceptor(fieldName: string, destination?: string): Type<NestInterceptor> {
  return FastifyFileInterceptor(fieldName, {
    storage: diskStorage({
      destination: `uploads/${destination}/`,
      filename: editFileName as any
    }),
  });
}

type MulterInstance = any;
