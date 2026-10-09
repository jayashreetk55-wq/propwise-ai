import { Router } from 'express';
import { healthController } from '../../controllers/health.controller';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Health check endpoint for service status, uptime, and system diagnostics
 * @access  Public
 */
router.get('/', healthController.getHealth);

export const healthRoutes = router;
