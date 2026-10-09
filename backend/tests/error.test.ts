import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { z } from 'zod';
import { app } from '../src/app';
import { validateRequest } from '../src/middleware/validate.middleware';
import { errorHandler } from '../src/middleware/errorHandler.middleware';
import { BadRequestError, UnauthorizedError } from '../src/errors/appError';

describe('Error Handling Middleware', () => {
  it('should return 404 NOT_FOUND for non-existent route', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.message).toContain('not found');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should return 400 MALFORMED_JSON when invalid JSON is sent', async () => {
    const res = await request(app)
      .post('/api/v1/health')
      .set('Content-Type', 'application/json')
      .send('{"badJson": ');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error.code).toBe('MALFORMED_JSON');
  });

  it('should catch AppError subclasses and format them with appropriate status and code', async () => {
    const testApp = express();
    testApp.use(express.json());

    testApp.get('/test-bad-request', () => {
      throw new BadRequestError('Invalid input provided', { field: 'price' });
    });

    testApp.get('/test-unauthorized', () => {
      throw new UnauthorizedError('Authentication token missing');
    });

    testApp.use(errorHandler);

    const badRequestRes = await request(testApp).get('/test-bad-request');
    expect(badRequestRes.status).toBe(400);
    expect(badRequestRes.body.success).toBe(false);
    expect(badRequestRes.body.error.code).toBe('BAD_REQUEST');
    expect(badRequestRes.body.error.details).toEqual({ field: 'price' });

    const authRes = await request(testApp).get('/test-unauthorized');
    expect(authRes.status).toBe(401);
    expect(authRes.body.success).toBe(false);
    expect(authRes.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should validate request body and return 422 VALIDATION_ERROR on invalid input', async () => {
    const testApp = express();
    testApp.use(express.json());

    const sampleSchema = {
      body: z.object({
        city: z.string().min(2, 'City name must be at least 2 characters'),
        budget: z.number().positive('Budget must be positive'),
      }),
    };

    testApp.post('/test-validation', validateRequest(sampleSchema), (_req, res) => {
      res.json({ success: true });
    });

    testApp.use(errorHandler);

    // Test failing validation
    const invalidRes = await request(testApp)
      .post('/test-validation')
      .send({ city: 'A', budget: -500 });

    expect(invalidRes.status).toBe(422);
    expect(invalidRes.body.success).toBe(false);
    expect(invalidRes.body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(invalidRes.body.error.details)).toBe(true);
    expect(invalidRes.body.error.details).toHaveLength(2);

    // Test passing validation
    const validRes = await request(testApp)
      .post('/test-validation')
      .send({ city: 'San Francisco', budget: 1500000 });

    expect(validRes.status).toBe(200);
    expect(validRes.body.success).toBe(true);
  });
});
