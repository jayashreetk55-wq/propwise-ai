import { Request, Response, NextFunction } from 'express';
import { healthService } from '../services/health.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import { HttpStatusCodes } from '../constants/httpStatusCodes';

export class HealthController {
  getHealth = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const healthData = healthService.getHealthStatus();
      ApiResponseHelper.success(
        res,
        'PropWise AI backend service is healthy',
        healthData,
        HttpStatusCodes.OK
      );
    } catch (error) {
      next(error);
    }
  };
}

export const healthController = new HealthController();
