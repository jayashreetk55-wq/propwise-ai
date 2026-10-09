import { Request, Response, NextFunction } from 'express';
import { propertyService } from '../services/property.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import { HttpStatusCodes } from '../constants/httpStatusCodes';
import { PropertyQueryInput } from '../validators/property.validator';

export class PropertyController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('Authenticated user required');
      }

      const property = await propertyService.createProperty(req.body, userId);
      ApiResponseHelper.success(
        res,
        'Property listing created successfully',
        property,
        HttpStatusCodes.CREATED
      );
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const property = await propertyService.getPropertyById(req.params.id);
      ApiResponseHelper.success(
        res,
        'Property retrieved successfully',
        property,
        HttpStatusCodes.OK
      );
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await propertyService.getProperties(req.query as unknown as PropertyQueryInput);
      ApiResponseHelper.success(
        res,
        'Properties retrieved successfully',
        result,
        HttpStatusCodes.OK
      );
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        throw new Error('Authenticated user required');
      }

      const updated = await propertyService.updateProperty(req.params.id, req.body, user);
      ApiResponseHelper.success(
        res,
        'Property listing updated successfully',
        updated,
        HttpStatusCodes.OK
      );
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        throw new Error('Authenticated user required');
      }

      const deleted = await propertyService.deleteProperty(req.params.id, user);
      ApiResponseHelper.success(
        res,
        'Property listing deleted successfully',
        deleted,
        HttpStatusCodes.OK
      );
    } catch (error) {
      next(error);
    }
  };
}

export const propertyController = new PropertyController();
