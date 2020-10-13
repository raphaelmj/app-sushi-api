import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
const helmet = require("helmet");
import * as cookieParser from 'cookie-parser';
const bodyParser = require('body-parser')
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );
  app.useStaticAssets(join(__dirname, '.', 'static'));
  app.useStaticAssets(join(__dirname, '.', 'ngadmin'));
  app.use(cookieParser());
  app.use(helmet());
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATH', 'OPTION', 'DELETE'],
    allowedHeaders: ['*'],
    credentials: true
  });
  await app.listen(3000);
}
bootstrap();
