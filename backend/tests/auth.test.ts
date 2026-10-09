import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { app } from '../src/app';
import { prisma } from '../src/database';
import { config } from '../src/config';

// Mock database layer for isolated unit/integration tests
vi.mock('../src/database', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
  checkDatabaseHealth: vi.fn().mockResolvedValue({ status: 'connected', latencyMs: 2 }),
  disconnectDatabase: vi.fn().mockResolvedValue(undefined),
}));

describe('Authentication Module (POST /api/v1/auth/register, POST /api/v1/auth/login, GET /api/v1/auth/me)', () => {
  const mockUserFindUnique = vi.mocked(prisma.user.findUnique);
  const mockUserCreate = vi.mocked(prisma.user.create);

  const rawPassword = 'Password123!';
  const hashedPassword = bcrypt.hashSync(rawPassword, 10);

  const mockDbUser = {
    id: 'f87b2e3e-4d87-4389-9a25-c6bf0b3e5c91',
    email: 'investor@propwise.ai',
    password: hashedPassword,
    name: 'Jane Doe',
    firstName: 'Jane',
    lastName: 'Doe',
    phone: '+1-555-0100',
    role: 'INVESTOR' as const,
    isActive: true,
    createdAt: new Date('2026-10-01T00:00:00.000Z'),
    updatedAt: new Date('2026-10-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a new user, return 201, and exclude password from response', async () => {
      mockUserFindUnique.mockResolvedValueOnce(null);
      mockUserCreate.mockResolvedValueOnce(mockDbUser);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'investor@propwise.ai',
          password: rawPassword,
          name: 'Jane Doe',
          role: 'INVESTOR',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('token');
      expect(typeof res.body.data.token).toBe('string');

      const user = res.body.data.user;
      expect(user.id).toBe(mockDbUser.id);
      expect(user.email).toBe(mockDbUser.email);
      expect(user.name).toBe('Jane Doe');
      expect(user.role).toBe('INVESTOR');
      expect(user.password).toBeUndefined(); // Crucial: never expose password hash
    });

    it('should return 409 Conflict when attempting to register with an existing email', async () => {
      mockUserFindUnique.mockResolvedValueOnce(mockDbUser);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'investor@propwise.ai',
          password: rawPassword,
          name: 'Jane Doe',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.message).toContain('already exists');
    });

    it('should return 422 Validation Error when input fields are invalid', async () => {
      // 1. Invalid email format
      const invalidEmailRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          password: rawPassword,
        });

      expect(invalidEmailRes.status).toBe(422);
      expect(invalidEmailRes.body.error.code).toBe('VALIDATION_ERROR');

      // 2. Password too short (< 8 chars)
      const shortPasswordRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'valid@propwise.ai',
          password: 'pass',
        });

      expect(shortPasswordRes.status).toBe(422);
      expect(shortPasswordRes.body.error.code).toBe('VALIDATION_ERROR');

      // 3. Password without digits
      const noDigitPasswordRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'valid@propwise.ai',
          password: 'PasswordOnly',
        });

      expect(noDigitPasswordRes.status).toBe(422);
      expect(noDigitPasswordRes.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should successfully log in with valid credentials and return a signed JWT', async () => {
      mockUserFindUnique.mockResolvedValueOnce(mockDbUser);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'investor@propwise.ai',
          password: rawPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(mockDbUser.email);
      expect(res.body.data.user.password).toBeUndefined(); // Must not expose password hash

      // Verify returned token is decryptable and valid
      const decoded = jwt.verify(res.body.data.token, config.jwtSecret) as { id: string; email: string };
      expect(decoded.id).toBe(mockDbUser.id);
      expect(decoded.email).toBe(mockDbUser.email);
    });

    it('should return 401 Unauthorized when password does not match', async () => {
      mockUserFindUnique.mockResolvedValueOnce(mockDbUser);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'investor@propwise.ai',
          password: 'IncorrectPassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should return 401 Unauthorized when email does not exist', async () => {
      mockUserFindUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@propwise.ai',
          password: rawPassword,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.message).toBe('Invalid email or password');
    });
  });

  describe('Protected Route: GET /api/v1/auth/me', () => {
    it('should access protected endpoint with a valid Bearer token', async () => {
      const validToken = jwt.sign(
        { id: mockDbUser.id, email: mockDbUser.email, role: mockDbUser.role },
        config.jwtSecret,
        { expiresIn: '1h' }
      );

      mockUserFindUnique.mockResolvedValueOnce(mockDbUser);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(mockDbUser.id);
      expect(res.body.data.email).toBe(mockDbUser.email);
      expect(res.body.data.password).toBeUndefined();
    });

    it('should return 401 Unauthorized when Authorization header is missing', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.message).toContain('token is required');
    });

    it('should return 401 Unauthorized when Authorization format is invalid', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'InvalidFormatHeader');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 Unauthorized when JWT token is invalid or tampered', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.tampered.token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
