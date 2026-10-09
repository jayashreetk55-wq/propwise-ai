import { Router } from 'express';
import { v1Routes } from './v1';

const router = Router();

// Versioned API routes
router.use('/v1', v1Routes);

export const apiRouter = router;
