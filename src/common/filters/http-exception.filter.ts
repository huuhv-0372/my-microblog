import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // csurf sets err.status = 403 and err.code = 'EBADCSRFTOKEN' on plain JS errors
    const errAny = exception as Record<string, unknown>;
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : typeof errAny?.['status'] === 'number'
          ? errAny['status']
          : HttpStatus.INTERNAL_SERVER_ERROR;

    // Log every unhandled 5xx exception
    if (status >= 500) {
      this.logger.error(
        `Unhandled ${request.method} ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    if (status === HttpStatus.NOT_FOUND) {
      response.status(404).render('errors/404', {
        url: request.url,
        layout: 'main',
      });
      return;
    }

    // For CSRF validation failures (403), redirect back to where the user came from
    if (status === HttpStatus.FORBIDDEN) {
      const referer = (request.headers['referer'] as string) ?? '/';
      response.redirect(referer);
      return;
    }

    response.status(status).render('errors/500', {
      status,
      layout: 'main',
    });
  }
}
