import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';

@Catch()
export class LoggingExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : 500;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception.message;

    const user =
      req['user'] ? `user_id=${req['user'].userId}` : 'guest';

    this.logger.error(
      `${req.method} ${req.url} ERROR ${status} ${user}`,
      typeof message === 'string' ? message : JSON.stringify(message),
    );

    res.status(status).json({
      statusCode: status,
      path: req.url,
      error: message,
    });
  }
}
