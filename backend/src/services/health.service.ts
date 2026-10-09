import { config } from '../config';
import { HealthCheckData } from '../types';
import { checkDatabaseHealth } from '../database';

export class HealthService {
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  }

  async getHealthStatus(): Promise<HealthCheckData> {
    const uptimeSeconds = Math.floor(process.uptime());
    const mem = process.memoryUsage();
    const database = await checkDatabaseHealth();

    return {
      status: 'healthy',
      service: config.serviceName,
      version: config.serviceVersion,
      environment: config.nodeEnv,
      uptimeSeconds,
      uptimeFormatted: this.formatUptime(uptimeSeconds),
      timestamp: new Date().toISOString(),
      database,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsageMB: {
          rss: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
          heapTotal: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
          heapUsed: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
        },
      },
    };
  }
}

export const healthService = new HealthService();
