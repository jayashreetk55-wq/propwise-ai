import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app';
import { prisma } from '../src/database';
import { config } from '../src/config';

// Mock database layer for deterministic, isolated testing
vi.mock('../src/database', () => {
  const mockProperty = {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const mockPriceHistory = {
    create: vi.fn(),
  };

  return {
    prisma: {
      property: mockProperty,
      propertyPriceHistory: mockPriceHistory,
      $transaction: vi.fn(async (arg) => {
        if (Array.isArray(arg)) {
          return Promise.all(arg);
        }
        if (typeof arg === 'function') {
          const tx = {
            property: mockProperty,
            propertyPriceHistory: mockPriceHistory,
          };
          return arg(tx);
        }
        return arg;
      }),
    },
    checkDatabaseHealth: vi.fn().mockResolvedValue({ status: 'connected' }),
    disconnectDatabase: vi.fn().mockResolvedValue(undefined),
  };
});

describe('Property Management API (/api/v1/properties)', () => {
  const mockPropertyCreate = vi.mocked(prisma.property.create);
  const mockPropertyFindUnique = vi.mocked(prisma.property.findUnique);
  const mockPropertyFindMany = vi.mocked(prisma.property.findMany);
  const mockPropertyCount = vi.mocked(prisma.property.count);
  const mockPropertyUpdate = vi.mocked(prisma.property.update);
  const mockPropertyDelete = vi.mocked(prisma.property.delete);
  const mockPriceHistoryCreate = vi.mocked(prisma.propertyPriceHistory.create);

  const ownerUserId = 'owner-uuid-1111';
  const otherUserId = 'other-uuid-2222';
  const adminUserId = 'admin-uuid-9999';

  const ownerToken = jwt.sign(
    { id: ownerUserId, email: 'owner@propwise.ai', role: 'AGENT' },
    config.jwtSecret,
    { expiresIn: '1h' }
  );

  const otherUserToken = jwt.sign(
    { id: otherUserId, email: 'buyer@propwise.ai', role: 'BUYER' },
    config.jwtSecret,
    { expiresIn: '1h' }
  );

  const adminToken = jwt.sign(
    { id: adminUserId, email: 'admin@propwise.ai', role: 'ADMIN' },
    config.jwtSecret,
    { expiresIn: '1h' }
  );

  const sampleProperty = {
    id: 'prop-uuid-7777',
    title: 'Luxury Downtown Penthouse',
    description: 'Breathtaking 3-bedroom luxury penthouse overlooking the waterfront.',
    propertyType: 'PENTHOUSE',
    listingType: 'SALE',
    status: 'AVAILABLE',
    price: 1850000.0,
    currency: 'USD',
    areaSqFt: 2200.0,
    bedrooms: 3,
    bathrooms: 3.5,
    furnishing: 'FULLY_FURNISHED',
    city: 'San Francisco',
    locality: 'South Beach',
    address: '100 Main St',
    zipCode: '94105',
    latitude: 37.791,
    longitude: -122.395,
    yearBuilt: 2020,
    createdById: ownerUserId,
    createdAt: new Date('2026-10-01T00:00:00.000Z'),
    updatedAt: new Date('2026-10-01T00:00:00.000Z'),
    images: [],
    amenities: [],
    createdBy: {
      id: ownerUserId,
      name: 'Owner Agent',
      email: 'owner@propwise.ai',
      role: 'AGENT',
    },
    priceHistory: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/properties (Create Listing)', () => {
    const validCreatePayload = {
      title: 'Luxury Downtown Penthouse',
      description: 'Breathtaking 3-bedroom luxury penthouse overlooking the waterfront.',
      propertyType: 'PENTHOUSE',
      listingType: 'SALE',
      price: 1850000,
      areaSqFt: 2200,
      bedrooms: 3,
      bathrooms: 3.5,
      furnishing: 'FULLY_FURNISHED',
      city: 'San Francisco',
      locality: 'South Beach',
      address: '100 Main St',
      zipCode: '94105',
      latitude: 37.791,
      longitude: -122.395,
    };

    it('should create property listing when authenticated, returning 201', async () => {
      mockPropertyCreate.mockResolvedValueOnce(sampleProperty as any);

      const res = await request(app)
        .post('/api/v1/properties')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(validCreatePayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('created');
      expect(res.body.data.id).toBe(sampleProperty.id);
      expect(mockPropertyCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: validCreatePayload.title,
            createdById: ownerUserId,
          }),
        })
      );
    });

    it('should return 401 Unauthorized when attempting to create listing without JWT', async () => {
      const res = await request(app)
        .post('/api/v1/properties')
        .send(validCreatePayload);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 422 Validation Error when required fields are missing or invalid', async () => {
      const res = await request(app)
        .post('/api/v1/properties')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Hi', // too short (< 3)
          price: -500, // negative
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(res.body.error.details)).toBe(true);
    });
  });

  describe('GET /api/v1/properties (List & Filter)', () => {
    it('should list properties with pagination metadata', async () => {
      mockPropertyCount.mockResolvedValueOnce(1);
      mockPropertyFindMany.mockResolvedValueOnce([sampleProperty as any]);

      const res = await request(app)
        .get('/api/v1/properties?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.properties).toHaveLength(1);

      const pagination = res.body.data.pagination;
      expect(pagination).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it('should pass query filters (city, price, propertyType) to database query', async () => {
      mockPropertyCount.mockResolvedValueOnce(0);
      mockPropertyFindMany.mockResolvedValueOnce([]);

      const res = await request(app)
        .get('/api/v1/properties?city=San%20Francisco&minPrice=1000000&maxPrice=2000000&propertyType=PENTHOUSE');

      expect(res.status).toBe(200);
      expect(mockPropertyFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            city: { contains: 'San Francisco', mode: 'insensitive' },
            propertyType: 'PENTHOUSE',
            price: { gte: 1000000, lte: 2000000 },
          }),
        })
      );
    });
  });

  describe('GET /api/v1/properties/:id (Get Single Property)', () => {
    it('should retrieve single property by ID', async () => {
      mockPropertyFindUnique.mockResolvedValueOnce(sampleProperty as any);

      const res = await request(app).get(`/api/v1/properties/${sampleProperty.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(sampleProperty.id);
      expect(res.body.data.title).toBe(sampleProperty.title);
    });

    it('should return 404 Not Found if property does not exist', async () => {
      mockPropertyFindUnique.mockResolvedValueOnce(null);

      const res = await request(app).get('/api/v1/properties/nonexistent-id');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/v1/properties/:id (Update Listing & Ownership Authorization)', () => {
    it('should update property successfully when user is the owner', async () => {
      mockPropertyFindUnique.mockResolvedValueOnce(sampleProperty as any);
      const updatedProp = { ...sampleProperty, title: 'Updated Penthouse Title' };
      mockPropertyUpdate.mockResolvedValueOnce(updatedProp as any);

      const res = await request(app)
        .put(`/api/v1/properties/${sampleProperty.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ title: 'Updated Penthouse Title' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Penthouse Title');
    });

    it('should allow ADMIN to update listing owned by another user', async () => {
      mockPropertyFindUnique.mockResolvedValueOnce(sampleProperty as any);
      const updatedProp = { ...sampleProperty, status: 'SOLD' };
      mockPropertyUpdate.mockResolvedValueOnce(updatedProp as any);

      const res = await request(app)
        .put(`/api/v1/properties/${sampleProperty.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'SOLD' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 403 Forbidden when user is NOT the owner and NOT an admin', async () => {
      mockPropertyFindUnique.mockResolvedValueOnce(sampleProperty as any);

      const res = await request(app)
        .put(`/api/v1/properties/${sampleProperty.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ title: 'Malicious Title Change' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.message).toContain('not authorized');
    });

    it('should return 401 Unauthorized when update is attempted without token', async () => {
      const res = await request(app)
        .put(`/api/v1/properties/${sampleProperty.id}`)
        .send({ title: 'New Title' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 Not Found when updating a non-existent property', async () => {
      mockPropertyFindUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/v1/properties/nonexistent-id')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ title: 'New Title' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should record a PriceHistory entry when property price changes', async () => {
      mockPropertyFindUnique.mockResolvedValueOnce(sampleProperty as any);
      const newPrice = 1750000;
      const updatedProp = { ...sampleProperty, price: newPrice };
      mockPropertyUpdate.mockResolvedValueOnce(updatedProp as any);
      mockPriceHistoryCreate.mockResolvedValueOnce({ id: 'history-1' } as any);

      const res = await request(app)
        .put(`/api/v1/properties/${sampleProperty.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          price: newPrice,
          priceReason: 'Summer price reduction',
        });

      expect(res.status).toBe(200);
      expect(mockPriceHistoryCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            propertyId: sampleProperty.id,
            previousPrice: sampleProperty.price,
            newPrice: newPrice,
            reason: 'Summer price reduction',
          }),
        })
      );
    });
  });

  describe('DELETE /api/v1/properties/:id (Delete Listing & Ownership Authorization)', () => {
    it('should delete property successfully when user is the owner', async () => {
      mockPropertyFindUnique.mockResolvedValueOnce(sampleProperty as any);
      mockPropertyDelete.mockResolvedValueOnce(sampleProperty as any);

      const res = await request(app)
        .delete(`/api/v1/properties/${sampleProperty.id}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted');
      expect(mockPropertyDelete).toHaveBeenCalledWith({
        where: { id: sampleProperty.id },
      });
    });

    it('should allow ADMIN to delete property owned by another user', async () => {
      mockPropertyFindUnique.mockResolvedValueOnce(sampleProperty as any);
      mockPropertyDelete.mockResolvedValueOnce(sampleProperty as any);

      const res = await request(app)
        .delete(`/api/v1/properties/${sampleProperty.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 403 Forbidden when delete is attempted by non-owner, non-admin', async () => {
      mockPropertyFindUnique.mockResolvedValueOnce(sampleProperty as any);

      const res = await request(app)
        .delete(`/api/v1/properties/${sampleProperty.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(mockPropertyDelete).not.toHaveBeenCalled();
    });

    it('should return 401 Unauthorized when delete is attempted without token', async () => {
      const res = await request(app).delete(`/api/v1/properties/${sampleProperty.id}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 Not Found when deleting a non-existent property', async () => {
      mockPropertyFindUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .delete('/api/v1/properties/nonexistent-id')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
