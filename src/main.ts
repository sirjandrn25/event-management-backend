import { ClassSerializerInterceptor } from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';

import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { config as AWSConfig } from 'aws-sdk';

AWSConfig.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //make global prefix of api
  app.setGlobalPrefix('v1/api');
  // integrate swagger
  const config = new DocumentBuilder()
    .setTitle('Event Management')
    .setDescription('The Event Management API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();
  const corsOptions: CorsOptions = {
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://event-management-frontend-pi.vercel.app'
        : 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };
  // Enable CORS with the specified options
  app.enableCors(corsOptions);

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  //exception filter handle
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  //global interceptor
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await app.listen(process.env.PORT || 8000);
}
bootstrap();
