import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './validators/global-exception.filter';
import { AppConfiguration } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
      stopAtFirstError: false,
    }),
  );

  const configService = app.get(ConfigService);
  
  // Register global exception filter with config service
  app.useGlobalFilters(new GlobalExceptionFilter(configService));

  const port = configService.get<AppConfiguration['port']>('port', 4000);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
