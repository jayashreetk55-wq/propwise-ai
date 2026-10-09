import { Prisma } from '@prisma/client';
import { prisma } from '../database';
import { NotFoundError, ForbiddenError } from '../errors/appError';
import {
  CreatePropertyInput,
  UpdatePropertyInput,
  PropertyQueryInput,
} from '../validators/property.validator';
import { AuthUserPayload, PaginationMeta } from '../types';

export class PropertyService {
  async createProperty(input: CreatePropertyInput, userId: string) {
    const { images, amenityIds, ...propertyData } = input;

    const createdProperty = await prisma.property.create({
      data: {
        ...propertyData,
        createdById: userId,
        images: images && images.length > 0
          ? {
              create: images.map((img, idx) => ({
                url: img.url,
                caption: img.caption || null,
                isPrimary: img.isPrimary ?? idx === 0,
                displayOrder: img.displayOrder ?? idx,
              })),
            }
          : undefined,
        amenities: amenityIds && amenityIds.length > 0
          ? {
              create: amenityIds.map((amenityId) => ({
                amenityId,
              })),
            }
          : undefined,
      },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        amenities: {
          include: { amenity: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return createdProperty;
  }

  async getPropertyById(id: string) {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        amenities: {
          include: { amenity: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        priceHistory: {
          orderBy: { effectiveDate: 'desc' },
        },
      },
    });

    if (!property) {
      throw new NotFoundError(`Property with ID '${id}' not found`);
    }

    return property;
  }

  async getProperties(query: PropertyQueryInput) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {};

    if (query.city) {
      where.city = { contains: query.city, mode: 'insensitive' };
    }
    if (query.locality) {
      where.locality = { contains: query.locality, mode: 'insensitive' };
    }
    if (query.propertyType) {
      where.propertyType = query.propertyType;
    }
    if (query.listingType) {
      where.listingType = query.listingType;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.furnishing) {
      where.furnishing = query.furnishing;
    }
    if (query.bedrooms !== undefined) {
      where.bedrooms = query.bedrooms;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) {
        where.price.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        where.price.lte = query.maxPrice;
      }
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    const orderBy: Prisma.PropertyOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [total, properties] = await prisma.$transaction([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          amenities: {
            include: { amenity: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    const pagination: PaginationMeta = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return {
      properties,
      pagination,
    };
  }

  async updateProperty(id: string, input: UpdatePropertyInput, user: AuthUserPayload) {
    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Property with ID '${id}' not found`);
    }

    // Ownership or Admin authorization check
    const isOwner = existing.createdById === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('You are not authorized to modify this property listing');
    }

    const { priceReason, images, amenityIds, ...updateData } = input;

    // Detect price adjustment and create price history entry
    const isPriceChanged =
      updateData.price !== undefined &&
      Number(updateData.price) !== Number(existing.price);

    const updatedProperty = await prisma.$transaction(async (tx) => {
      if (isPriceChanged && updateData.price !== undefined) {
        const previousPriceNum = Number(existing.price);
        const newPriceNum = Number(updateData.price);
        const changePercentage = previousPriceNum > 0
          ? ((newPriceNum - previousPriceNum) / previousPriceNum) * 100
          : 0;

        await tx.propertyPriceHistory.create({
          data: {
            propertyId: id,
            previousPrice: existing.price,
            newPrice: updateData.price,
            changePercentage: parseFloat(changePercentage.toFixed(2)),
            reason: priceReason || 'Price updated by owner',
          },
        });
      }

      return tx.property.update({
        where: { id },
        data: updateData,
        include: {
          images: {
            orderBy: { displayOrder: 'asc' },
          },
          amenities: {
            include: { amenity: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
          priceHistory: {
            orderBy: { effectiveDate: 'desc' },
          },
        },
      });
    });

    return updatedProperty;
  }

  async deleteProperty(id: string, user: AuthUserPayload) {
    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Property with ID '${id}' not found`);
    }

    // Ownership or Admin authorization check
    const isOwner = existing.createdById === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('You are not authorized to delete this property listing');
    }

    await prisma.property.delete({
      where: { id },
    });

    return { id, title: existing.title };
  }
}

export const propertyService = new PropertyService();
