// src/main.ts

import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RolesGuard } from './auth/roles.guard';

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 3001);
  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:5173',
  );

  /*
   * ===============================
   * CORS
   * ===============================
   */
  app.enableCors({
    origin: [frontendUrl],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  logger.log(`CORS enabled for: ${frontendUrl}`);

  /*
   * ===============================
   * Global Pipes
   * ===============================
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  /*
   * ===============================
   * Global Interceptors & Filters
   * ===============================
   */
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  /*
   * ===============================
   * Rejestracja Guardów globalnie
   * ===============================
   */
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new RolesGuard(reflector));

  /*
   * ===============================
   * Swagger
   * ===============================
   */

  const swaggerConfig = new DocumentBuilder()
    .setTitle(configService.get<string>('SWAGGER_API_TITLE', 'Parts Shop API'))
    .setDescription(
      configService.get<string>(
        'SWAGGER_API_DESC',
        'REST API for car parts shop with JWT authentication and RBAC.',
      ),
    )
    .setVersion(configService.get<string>('SWAGGER_API_VERSION', '1.0'))
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT access token',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(
    configService.get<string>('SWAGGER_API_DOCS_PATH', 'api-docs'),
    app,
    document,
  );

  await app.listen(port);

  logger.log(`🚀 Server running on http://localhost:${port}`);
  logger.log(
    `📚 Swagger: http://localhost:${port}/${configService.get<string>(
      'SWAGGER_API_DOCS_PATH',
      'api-docs',
    )}`,
  );
}

if (require.main === module) {
  bootstrap();
}
