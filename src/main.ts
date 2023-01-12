import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, LoggerService } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import * as morgan from 'morgan';
import { ValidateInputPipe } from './core/pipes/validation.pipes';
import { ResponseInterceptor } from './core/interceptors/response.interceptors';
import { MongoExceptions } from './core/exceptions/mongo.exceptions';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = <number>(<unknown>process.env.PORT);
  const logger: LoggerService = new Logger();

  app.use(helmet());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(morgan('dev'));
  app.setGlobalPrefix('api');
  // handle all user input validation globally
  app.useGlobalPipes(
    new ValidateInputPipe({
      forbidUnknownValues: false,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new MongoExceptions());
  await app.listen(port, () => {
    logger.log(`Server running on port ${port}`);
  });
}
bootstrap();
