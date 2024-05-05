import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';
import { ClassSerializerInterceptor } from '@nestjs/common';

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
    .setTitle('chat')
    .setDescription('The chat API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  app.enableCors();

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
