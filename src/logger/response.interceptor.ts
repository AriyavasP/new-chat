import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private logger = new Logger(ResponseInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      tap(() => {
        const responseBody = response.locals.body; // Assuming you set response body before sending response
        if (responseBody) {
          this.logger.log(`Response body: ${JSON.stringify(responseBody)}`);
        }
      }),
    );
  }
}
