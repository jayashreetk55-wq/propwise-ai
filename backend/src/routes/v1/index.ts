import { Router } from 'express';
import { healthRoutes } from './health.routes';
import { authRoutes } from './auth.routes';
import { propertyRoutes } from './property.routes';

const router = Router();

// Register v1 sub-routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);

export const v1Routes = router;
