import { Router } from 'express';
import { propertyController } from '../../controllers/property.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createPropertySchema,
  updatePropertySchema,
  propertyQuerySchema,
} from '../../validators/property.validator';

const router = Router();

/**
 * @route   POST /api/v1/properties
 * @desc    Create a new real estate property listing
 * @access  Protected (Requires Bearer token)
 */
router.post(
  '/',
  authenticate,
  validateRequest({ body: createPropertySchema }),
  propertyController.create
);

/**
 * @route   GET /api/v1/properties
 * @desc    List property listings with pagination, sorting, and multi-attribute filters
 * @access  Public
 */
router.get(
  '/',
  validateRequest({ query: propertyQuerySchema }),
  propertyController.list
);

/**
 * @route   GET /api/v1/properties/:id
 * @desc    Retrieve a single property by its unique identifier
 * @access  Public
 */
router.get('/:id', propertyController.getById);

/**
 * @route   PUT /api/v1/properties/:id
 * @desc    Update a property listing (Enforces ownership or admin role)
 * @access  Protected (Requires Bearer token)
 */
router.put(
  '/:id',
  authenticate,
  validateRequest({ body: updatePropertySchema }),
  propertyController.update
);

/**
 * @route   DELETE /api/v1/properties/:id
 * @desc    Delete a property listing (Enforces ownership or admin role)
 * @access  Protected (Requires Bearer token)
 */
router.delete('/:id', authenticate, propertyController.delete);

export const propertyRoutes = router;
