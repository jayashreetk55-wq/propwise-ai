import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from '../errors/appError';
import { AuthUserPayload } from '../types';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new UnauthorizedError('Authentication token is required'));
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return next(new UnauthorizedError('Invalid authorization format. Expected: Bearer <token>'));
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUserPayload;

    if (!decoded.id || !decoded.email) {
      return next(new UnauthorizedError('Malformed token payload'));
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name ?? null,
    };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(new UnauthorizedError('Authentication token has expired'));
    }
    if (error instanceof JsonWebTokenError) {
      return next(new UnauthorizedError('Invalid authentication token'));
    }
    return next(new UnauthorizedError('Failed to authenticate token'));
  }
};
