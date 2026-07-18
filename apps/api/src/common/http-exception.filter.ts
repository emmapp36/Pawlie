import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ApiError } from '@pawlie/domain';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? this.extractMessage(exception)
        : 'Internal server error';

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ApiError = {
      statusCode: status,
      error: HttpStatus[status] ?? 'Error',
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(body);
  }

  private extractMessage(exception: HttpException): string {
    const payload = exception.getResponse();
    if (typeof payload === 'string') return payload;
    const message = (payload as { message?: string | string[] }).message;
    return Array.isArray(message) ? message.join('; ') : message ?? exception.message;
  }
}
