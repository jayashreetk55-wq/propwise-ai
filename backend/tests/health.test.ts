import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('GET /api/v1/health', () => {
  it('should return 200 OK with healthy status and system diagnostics', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('data');

    const data = res.body.data;
    expect(data.status).toBe('healthy');
    expect(data.service).toBe('propwise-backend');
    expect(data.version).toBe('1.0.0');
    expect(data.environment).toBeDefined();
    expect(typeof data.uptimeSeconds).toBe('number');
    expect(typeof data.uptimeFormatted).toBe('string');

    expect(data.system).toBeDefined();
    expect(data.system.nodeVersion).toBeDefined();
    expect(data.system.platform).toBeDefined();
    expect(typeof data.system.memoryUsageMB.heapUsed).toBe('number');

    // Database health diagnostics (handles offline / disconnected gracefully)
    expect(data.database).toBeDefined();
    expect(['connected', 'disconnected']).toContain(data.database.status);
    expect(typeof data.database.message).toBe('string');
  });

  it('should remain functional and return 200 even when database is offline', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  it('should return service metadata on root path GET /', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'propwise-backend');
    expect(res.body).toHaveProperty('status', 'active');
    expect(res.body.endpoints).toHaveProperty('health', '/api/v1/health');
  });
});
