import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module';
import logger from './shared/utils/logger';
import * as process from 'node:process';
import { connectDB } from './shared/database/db';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Get the config service to access environment variables properly
  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT', 8988);
  const host = process.env.HOST; // Can be undefined for all interfaces

  app.setGlobalPrefix('api');

  await connectDB();

  app.useStaticAssets(join(process.cwd(), 'public'));
  app.setViewEngine('ejs');
  app.setBaseViewsDir(join(process.cwd(), 'view'));

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  try {
    if (host) {
      // If HOST is specified, bind to that specific interface
      await app.listen(port, host);
      const serverUrl = `http://${host === '0.0.0.0' ? '213.230.110.176' : host}:${port}`;
      logger.info(`✅ Application started on: ${serverUrl} (bound to ${host})`);
      console.log(`✅ Application started on: ${serverUrl} (bound to ${host})`);
      console.log(`🔍 Server accessible at: ${serverUrl}/api`);
    } else {
      // If HOST is not specified, bind to all interfaces
      await app.listen(port);
      logger.info(`✅ Application started on port ${port} (all interfaces)`);
      console.log(`✅ Application started on port ${port} (all interfaces)`);
      console.log(`🔍 Server accessible at: http://localhost:${port}/api or http://127.0.0.1:${port}/api`);
    }
  } catch (error) {
    logger.error(`❌ Failed to start application on port ${port}:`, error);
    throw error;
  }
}

bootstrap().catch((error) => {
  logger.error('Fatal error during bootstrap', error);
  process.exit(1);
});
