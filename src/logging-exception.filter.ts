import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class LoggingExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request & { user?: { id: number } }>();
    const res = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    const userId = req.user?.id ? `user_id=${req.user.id}` : 'guest';

    this.logger.error(
      `${req.method} ${req.url} ERROR ${status} ${userId}`,
      typeof message === 'string' ? message : JSON.stringify(message),
    );

    res.status(status).json({
      statusCode: status,
      path: req.url,
      error: message,
    });
  }
}
