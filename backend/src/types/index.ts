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
  database: {
    status: 'connected' | 'disconnected';
    latencyMs?: number;
    message?: string;
  };
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

export interface AuthUserPayload {
  id: string;
  email: string;
  role: string;
  name?: string | null;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface AuthResponseData {
  user: SafeUser;
  token: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

