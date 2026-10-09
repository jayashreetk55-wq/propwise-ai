import { Router } from 'express';
import { healthRoutes } from './health.routes';

const router = Router();

// Register v1 sub-routes
router.use('/health', healthRoutes);

export const v1Routes = router;
