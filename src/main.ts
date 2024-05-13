import helmet from '@fastify/helmet';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { contentParser } from 'fastify-multer';

import { appConfig } from '@shared/configs';
import { AllExceptionsFilter } from '@shared/filters';
import { ValidationPipe } from '@shared/pipes';

import { AppModule } from '@modules/app.module';

const port = appConfig.getPort();
const host = appConfig.getHost();

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { rawBody: true },
  );

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  await app.register(contentParser);

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

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(port, host, () => console.log(`Server started on port = ${port}`));
}
bootstrap();
