import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body } = req;
    const userAgent = req.get('user-agent') || '';

    // Log request information
    this.logger.log(`${method} ${originalUrl} - ${userAgent}`);
    if (Object.keys(body).length > 0) {
      this.logger.log(`Request body: ${JSON.stringify(body)}`);
    }

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const responseBody = res.locals.body; // Assuming you set response body before sending response
      // Log response information
      this.logger.log(`${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent}`);
      if (responseBody) {
        this.logger.log(`Response body: ${JSON.stringify(responseBody)}`);
      }
    });

    next();
  }
}
