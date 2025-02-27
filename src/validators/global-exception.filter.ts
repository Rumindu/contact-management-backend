import {
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Inject,
  Injectable,
  Optional,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError, TypeORMError } from 'typeorm';
import { ConfigService } from '@nestjs/config';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  details?: unknown;
}

@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isProduction: boolean;

  constructor(
    @Optional() @Inject(ConfigService) private configService?: ConfigService,
  ) {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';
    let details: unknown = undefined;

    this.logger.error(
      `Exception: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const typedResponse = exceptionResponse as Record<string, unknown>;
        message =
          (typedResponse.message as string | string[]) || exception.message;
        error = (typedResponse.error as string) || 'Error';
      } else {
        message = exception.message;
      }
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
      error = exception.message;
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = this.handleDatabaseError(exception);
      error = 'Database Error';

      if (!this.isProduction) {
        details = {
          query: exception.query,
          parameters: exception.parameters,
        };
      }
    } else if (exception instanceof TypeORMError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      error = 'Database Error';
    } else if (exception instanceof Error) {
      message = exception.message;

      if (!this.isProduction) {
        details = { stack: exception.stack };
      }
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (details && !this.isProduction) {
      errorResponse.details = details;
    }

    response.status(status).json(errorResponse);
  }

  private handleDatabaseError(exception: QueryFailedError): string {
    const errorMessage = exception.message;

    if (
      errorMessage.includes('duplicate key') ||
      errorMessage.includes('unique constraint')
    ) {
      return 'A record with this information already exists';
    }

    if (errorMessage.includes('foreign key constraint')) {
      return 'Referenced record does not exist or cannot be modified';
    }

    if (errorMessage.includes('check constraint')) {
      return 'Data validation failed at the database level';
    }

    return 'Database operation failed';
  }
}
