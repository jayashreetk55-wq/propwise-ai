import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 65535, {
      message: 'PORT must be a valid port number between 1 and 65535',
    }),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  API_PREFIX: z
    .string()
    .default('/api/v1')
    .refine((val) => val.startsWith('/'), {
      message: 'API_PREFIX must start with a forward slash (/)',
    }),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  SERVICE_NAME: z.string().default('propwise-backend'),
  SERVICE_VERSION: z.string().default('1.0.0'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const formattedErrors = parsedEnv.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  console.error(`\x1b[31m[Config Error] Invalid environment variables:\n${formattedErrors}\x1b[0m`);
  throw new Error(`Invalid environment configuration:\n${formattedErrors}`);
}

export const config = {
  port: parsedEnv.data.PORT,
  nodeEnv: parsedEnv.data.NODE_ENV,
  apiPrefix: parsedEnv.data.API_PREFIX,
  corsOrigin: parsedEnv.data.CORS_ORIGIN,
  serviceName: parsedEnv.data.SERVICE_NAME,
  serviceVersion: parsedEnv.data.SERVICE_VERSION,
  logLevel: parsedEnv.data.LOG_LEVEL,
  isProduction: parsedEnv.data.NODE_ENV === 'production',
  isDevelopment: parsedEnv.data.NODE_ENV === 'development',
  isTest: parsedEnv.data.NODE_ENV === 'test',
} as const;

export type AppConfig = typeof config;
