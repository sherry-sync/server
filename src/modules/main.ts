import fastifyCookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { contentParser } from 'fastify-multer';

import { appConfig, cookieConfig } from '@shared/configs';
import { AllExceptionsFilter } from '@shared/filters';
import { ValidationPipe } from '@shared/pipes';
import { PrismaService } from '@shared/services';

import { AppModule } from './app.module';

const port = appConfig.getPort();
const host = appConfig.getHost();
const frontApi = appConfig.getFrontApiLink();

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { rawBody: true },
  );

  app.enableCors({
    origin: frontApi,
    credentials: true,
  });

  await app.register(fastifyCookie, cookieConfig);

  await app.register(contentParser);

  config.update(appConfig.getAWSConfig());

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['\'self\''],
        styleSrc: ['\'self\'', '\'unsafe-inline\''],
        imgSrc: ['\'self\'', 'data:', 'validator.swagger.io'],
        scriptSrc: ['\'self\'', 'https: \'unsafe-inline\''],
      },
    },
  });

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(port, host, () => console.log(`Server started on port = ${port}`));
}
bootstrap();
