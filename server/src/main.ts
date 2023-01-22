import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Change the URL prefix to `/api` on backend
  app.setGlobalPrefix('api');

  // Build the OpenAPI document (published under `/api/docs`) with Swagger
  const doc_options = new DocumentBuilder().setTitle(`API Document`).build();
  const doc = SwaggerModule.createDocument(app, doc_options);
  if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
    // Enable Swagger UI for development env
    SwaggerModule.setup('api/docs', app, doc);
  }

  // Enable express-session for OAuth authentication
  app.use(
    session({
      secret: 'hello-nest',
      resave: false,
      saveUninitialized: true,
    }),
  );

  // Start the server
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
