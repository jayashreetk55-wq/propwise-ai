import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import { HttpStatusCodes } from '../constants/httpStatusCodes';

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.register(req.body);
      ApiResponseHelper.success(
        res,
        'User account registered successfully',
        result,
        HttpStatusCodes.CREATED
      );
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.login(req.body);
      ApiResponseHelper.success(
        res,
        'User logged in successfully',
        result,
        HttpStatusCodes.OK
      );
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('Authenticated user context missing');
      }

      const user = await authService.getCurrentUser(userId);
      ApiResponseHelper.success(
        res,
        'Current user profile retrieved successfully',
        user,
        HttpStatusCodes.OK
      );
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
