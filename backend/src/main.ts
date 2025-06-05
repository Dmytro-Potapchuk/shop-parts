// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config'; // <<< DODAJ IMPORT ConfigService

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService); // <<< POBIERZ INSTANCJĘ ConfigService

  // Ustawienia CORS - odczytywanie origin ze zmiennej środowiskowej
  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:5173',
  ); // Domyślnie 8080, jeśli zmienna nieustawiona
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });
  console.log(`[CORS] Zezwolono na żądania z origin: ${frontendUrl}`);

  // Globalny ValidationPipe - bez zmian, jest poprawny
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

  // Konfiguracja Swaggera - odczytywanie ustawień ze zmiennych środowiskowych
  const swaggerApiTitle = configService.get<string>(
    'SWAGGER_API_TITLE',
    'Sklep Części AutoMax API',
  );
  const swaggerApiDesc = configService.get<string>(
    'SWAGGER_API_DESC',
    'Dokumentacja API dla sklepu z częściami samochodowymi AutoMax',
  );
  const swaggerApiVersion = configService.get<string>(
    'SWAGGER_API_VERSION',
    '1.0',
  );
  const swaggerApiDocsPath = configService.get<string>(
    'SWAGGER_API_DOCS_PATH',
    'api-docs',
  );

  const config = new DocumentBuilder()
    .setTitle(swaggerApiTitle)
    .setDescription(swaggerApiDesc)
    .setVersion(swaggerApiVersion)
    .addTag('parts', 'Operacje na częściach samochodowych')
    .addTag('users', 'Operacje na użytkownikach i autentykacja')
    .addTag('Status Aplikacji', 'Ogólny status i informacje o API')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Wprowadź token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerApiDocsPath, app, document);

  const port = configService.get<number>('PORT', 3001); // <<< Odczytaj port z ConfigService
  await app.listen(port);
  console.log(`🚀 Serwer działa na http://localhost:${port}`);
  console.log(
    `📚 Dokumentacja Swagger UI dostępna pod http://localhost:${port}/${swaggerApiDocsPath}`,
  );
}

bootstrap();
