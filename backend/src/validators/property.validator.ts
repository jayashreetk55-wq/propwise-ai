import { z } from 'zod';

export const PropertyTypeEnum = z.enum([
  'APARTMENT',
  'VILLA',
  'INDEPENDENT_HOUSE',
  'CONDO',
  'TOWNHOUSE',
  'PENTHOUSE',
  'STUDIO',
  'COMMERCIAL',
  'PLOT',
]);

export const ListingTypeEnum = z.enum(['SALE', 'RENT']);

export const PropertyStatusEnum = z.enum([
  'AVAILABLE',
  'UNDER_OFFER',
  'SOLD',
  'RENTED',
  'INACTIVE',
]);

export const FurnishingStatusEnum = z.enum([
  'UNFURNISHED',
  'SEMI_FURNISHED',
  'FULLY_FURNISHED',
]);

const propertyImageInputSchema = z.object({
  url: z.string().url('Image must be a valid URL'),
  caption: z.string().max(255).optional(),
  isPrimary: z.boolean().default(false).optional(),
  displayOrder: z.number().int().min(0).default(0).optional(),
});

export const createPropertySchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters long')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters long'),
  propertyType: PropertyTypeEnum,
  listingType: ListingTypeEnum,
  status: PropertyStatusEnum.default('AVAILABLE').optional(),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .positive('Price must be greater than zero'),
  currency: z.string().max(10).default('USD').optional(),
  areaSqFt: z
    .number({ invalid_type_error: 'Area must be a number' })
    .positive('Area in square feet must be greater than zero'),
  bedrooms: z
    .number({ invalid_type_error: 'Bedrooms must be a number' })
    .int('Bedrooms must be an integer')
    .min(0, 'Bedrooms cannot be negative'),
  bathrooms: z
    .number({ invalid_type_error: 'Bathrooms must be a number' })
    .min(0, 'Bathrooms cannot be negative'),
  furnishing: FurnishingStatusEnum.default('UNFURNISHED').optional(),
  city: z.string().trim().min(1, 'City is required'),
  locality: z.string().trim().min(1, 'Locality is required'),
  address: z.string().trim().optional(),
  zipCode: z.string().trim().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  yearBuilt: z
    .number()
    .int()
    .min(1800, 'Year built must be after 1800')
    .max(new Date().getFullYear() + 5)
    .optional(),
  images: z.array(propertyImageInputSchema).optional(),
  amenityIds: z.array(z.string().uuid()).optional(),
});

export const updatePropertySchema = createPropertySchema
  .partial()
  .extend({
    priceReason: z
      .string()
      .trim()
      .max(255, 'Reason cannot exceed 255 characters')
      .optional(),
  });

export const propertyQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Page must be a positive integer',
    }),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, {
      message: 'Limit must be an integer between 1 and 100',
    }),
  city: z.string().trim().optional(),
  locality: z.string().trim().optional(),
  propertyType: PropertyTypeEnum.optional(),
  listingType: ListingTypeEnum.optional(),
  status: PropertyStatusEnum.optional(),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 0), {
      message: 'minPrice must be a non-negative number',
    }),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 0), {
      message: 'maxPrice must be a non-negative number',
    }),
  bedrooms: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 0), {
      message: 'Bedrooms must be a non-negative integer',
    }),
  furnishing: FurnishingStatusEnum.optional(),
  sortBy: z.enum(['price', 'createdAt', 'areaSqFt']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyQueryInput = z.infer<typeof propertyQuerySchema>;
