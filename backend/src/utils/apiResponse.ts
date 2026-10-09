import { Response } from 'express';
import { HttpStatusCodes, HttpStatusCode } from '../constants/httpStatusCodes';
import { ApiResponseSuccess, ApiResponseError } from '../types';

export class ApiResponseHelper {
  static success<T>(
    res: Response,
    message: string,
    data: T,
    statusCode: HttpStatusCode = HttpStatusCodes.OK
  ): Response {
    const payload: ApiResponseSuccess<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }

  static error(
    res: Response,
    message: string,
    statusCode: HttpStatusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR,
    code: string = 'INTERNAL_ERROR',
    details?: unknown,
    stack?: string
  ): Response {
    const payload: ApiResponseError = {
      success: false,
      message,
      error: {
        code,
        ...(details !== undefined ? { details } : {}),
        ...(stack ? { stack } : {}),
      },
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }
}
