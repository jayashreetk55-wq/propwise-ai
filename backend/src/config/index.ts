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
  DATABASE_URL: z
    .string()
    .default('postgresql://postgres:postgres@localhost:5432/propwise_db?schema=public')
    .refine((val) => val.startsWith('postgresql://') || val.startsWith('postgres://'), {
      message: 'DATABASE_URL must be a valid PostgreSQL connection string starting with postgresql:// or postgres://',
    }),
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET must be at least 16 characters')
    .default('propwise-default-jwt-secret-key-change-in-production-min32'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z
    .string()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 4 && val <= 16, {
      message: 'BCRYPT_SALT_ROUNDS must be a number between 4 and 16',
    }),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const formattedErrors = parsedEnv.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  console.error(`\x1b[31m[Config Error] Invalid environment variables:\n${formattedErrors}\x1b[0m`);
  throw new Error(`Invalid environment configuration:\n${formattedErrors}`);
}

// Ensure process.env.DATABASE_URL is set for Prisma Client when .env is absent
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = parsedEnv.data.DATABASE_URL;
}

export const config = {
  port: parsedEnv.data.PORT,
  nodeEnv: parsedEnv.data.NODE_ENV,
  apiPrefix: parsedEnv.data.API_PREFIX,
  corsOrigin: parsedEnv.data.CORS_ORIGIN,
  serviceName: parsedEnv.data.SERVICE_NAME,
  serviceVersion: parsedEnv.data.SERVICE_VERSION,
  logLevel: parsedEnv.data.LOG_LEVEL,
  databaseUrl: parsedEnv.data.DATABASE_URL,
  jwtSecret: parsedEnv.data.JWT_SECRET,
  jwtExpiresIn: parsedEnv.data.JWT_EXPIRES_IN,
  bcryptSaltRounds: parsedEnv.data.BCRYPT_SALT_ROUNDS,
  isProduction: parsedEnv.data.NODE_ENV === 'production',
  isDevelopment: parsedEnv.data.NODE_ENV === 'development',
  isTest: parsedEnv.data.NODE_ENV === 'test',
} as const;

export type AppConfig = typeof config;
