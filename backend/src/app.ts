import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { apiRouter } from './routes';
import { requestLogger } from './middleware/requestLogger.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';

export const createApp = (): Application => {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: config.corsOrigin.includes(',')
        ? config.corsOrigin.split(',').map((o) => o.trim())
        : config.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP Request Logging
  if (!config.isTest) {
    app.use(requestLogger);
  }

  // Root entrypoint / index
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: config.serviceName,
      version: config.serviceVersion,
      status: 'active',
      endpoints: {
        health: `${config.apiPrefix}/health`,
      },
    });
  });

  // Mount versioned API routes under /api
  app.use('/api', apiRouter);

  // 404 handler for unrecognized routes
  app.use(notFoundHandler);

  // Centralized error handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
