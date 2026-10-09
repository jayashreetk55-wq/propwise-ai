import { Router } from 'express';
import { authController } from '../../controllers/auth.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { registerSchema, loginSchema } from '../../validators/auth.validator';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user account with email and password
 * @access  Public
 */
router.post('/register', validateRequest({ body: registerSchema }), authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user credentials and issue JWT bearer token
 * @access  Public
 */
router.post('/login', validateRequest({ body: loginSchema }), authController.login);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently authenticated user's sanitized profile
 * @access  Protected (Requires Bearer token)
 */
router.get('/me', authenticate, authController.getMe);

export const authRoutes = router;
