import {
  Injectable,
  NestInterceptor,
  Logger,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { tap } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url } = req;
    const now = Date.now();

    return next
      .handle()
      .pipe(
        tap(() => this.logger.log(`${method} ${url} - ${Date.now() - now}ms`)),
      );
  }
}
