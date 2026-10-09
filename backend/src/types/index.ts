import { HttpStatusCode } from '../constants/httpStatusCodes';

export interface ApiResponseSuccess<T = unknown> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiResponseError {
  success: false;
  message: string;
  error: {
    code: string;
    details?: ApiErrorDetail[] | unknown;
    stack?: string;
  };
  timestamp: string;
}

export type ApiResponse<T = unknown> = ApiResponseSuccess<T> | ApiResponseError;

export interface HealthCheckData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  version: string;
  environment: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
  timestamp: string;
  system: {
    nodeVersion: string;
    platform: string;
    memoryUsageMB: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
    };
  };
}
