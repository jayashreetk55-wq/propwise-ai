import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { config } from '../config';
import { AppError } from '../errors/appError';
import { HttpStatusCodes, HttpStatusCode } from '../constants/httpStatusCodes';
import { ApiResponseHelper } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { ApiErrorDetail } from '../types';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode: HttpStatusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: unknown = undefined;

  // Handle known operational AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    message = err.message;
    details = err.details;
  }
  // Handle Zod validation errors that bypassed validate middleware
  else if (err instanceof ZodError) {
    statusCode = HttpStatusCodes.UNPROCESSABLE_ENTITY;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.issues.map((issue): ApiErrorDetail => ({
      field: issue.path.join('.') || 'root',
      message: issue.message,
      code: issue.code,
    }));
  }
  // Handle malformed JSON body errors
  else if (err instanceof SyntaxError && 'status' in err && (err as { status?: number }).status === 400) {
    statusCode = HttpStatusCodes.BAD_REQUEST;
    errorCode = 'MALFORMED_JSON';
    message = 'Malformed JSON payload provided in request body';
  }
  // Unhandled / Internal Server Errors
  else {
    logger.error(`[Unhandled Error] ${err.name}: ${err.message}`, {
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });

    if (config.isProduction) {
      message = 'An internal server error occurred. Please try again later.';
    } else {
      message = err.message || 'Internal server error';
    }
  }

  const stack = !config.isProduction && err.stack ? err.stack : undefined;

  ApiResponseHelper.error(res, message, statusCode, errorCode, details, stack);
};
