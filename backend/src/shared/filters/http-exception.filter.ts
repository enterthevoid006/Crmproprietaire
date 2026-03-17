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
    private readonly isProd = process.env.NODE_ENV === 'production';

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx      = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request  = ctx.getRequest<Request>();

        let status: number;
        let message: string;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            // Extract message — may be string, object, or array (validation)
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const body = exceptionResponse as Record<string, any>;
                if (Array.isArray(body.message)) {
                    message = body.message[0];
                } else {
                    message = body.message ?? exception.message;
                }
            } else {
                message = exception.message;
            }

            // 5xx from HttpException — hide in production
            if (status >= 500 && this.isProd) {
                this.logger.error(
                    `[${status}] ${request.method} ${request.url} — ${exception.message}`,
                );
                message = 'Une erreur est survenue';
            }
        } else {
            // Unhandled / unexpected error — always hide, always log
            status  = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Une erreur est survenue';

            const err = exception as Error | undefined;
            this.logger.error(
                `Unhandled exception ${request.method} ${request.url}: ${err?.message}`,
                err?.stack,
            );
        }

        response.status(status).json({ statusCode: status, message });
    }
}
