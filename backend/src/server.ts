import { app } from './app';
import { config } from './config';
import { logger } from './utils/logger';

import { disconnectDatabase } from './database';

const server = app.listen(config.port, () => {
  logger.info(`========================================================`);
  logger.info(`  PropWise AI Backend Service Running`);
  logger.info(`  Environment : ${config.nodeEnv}`);
  logger.info(`  Port        : ${config.port}`);
  logger.info(`  Health Check: http://localhost:${config.port}${config.apiPrefix}/health`);
  logger.info(`========================================================`);
});

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.warn(`Received ${signal}. Initiating graceful shutdown...`);

  await disconnectDatabase();

  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if connections hang
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught Exception: ${error.message}`, error.stack);
  process.exit(1);
});

export default server;
