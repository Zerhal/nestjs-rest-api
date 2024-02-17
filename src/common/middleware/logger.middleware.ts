import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as winston from 'winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = winston.createLogger({
    transports: [
      new winston.transports.File({
        filename: `logs/request-${new Date().toLocaleString('fr', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('-')}.log`,
        level: 'info',
      }),
    ],
  });

  use(req: Request, res: Response, next: NextFunction) {
    // Log request details to the file
    this.logger.info('Request...', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
    });

    // Continue with the request
    next();
  }
}
