import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { prisma } from '../database';
import { config } from '../config';
import { ConflictError, UnauthorizedError, NotFoundError } from '../errors/appError';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { AuthResponseData, SafeUser, AuthUserPayload } from '../types';

export class AuthService {
  private generateToken(payload: AuthUserPayload): string {
    const signOptions: SignOptions = {
      expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, config.jwtSecret, signOptions);
  }

  private sanitizeUser(user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): SafeUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async register(input: RegisterInput): Promise<AuthResponseData> {
    const normalizedEmail = input.email.toLowerCase().trim();

    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, config.bcryptSaltRounds);

    // Derive names
    const fullName = input.name?.trim() || null;
    let firstName: string | null = null;
    let lastName: string | null = null;

    if (fullName) {
      const parts = fullName.split(' ');
      firstName = parts[0] || null;
      lastName = parts.slice(1).join(' ') || null;
    }

    const assignedRole: UserRole = input.role
      ? (input.role as UserRole)
      : UserRole.BUYER;

    // Persist new user
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: fullName,
        firstName,
        lastName,
        phone: input.phone?.trim() || null,
        role: assignedRole,
      },
    });

    const userPayload: AuthUserPayload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    };

    const token = this.generateToken(userPayload);

    return {
      user: this.sanitizeUser(newUser),
      token,
    };
  }

  async login(input: LoginInput): Promise<AuthResponseData> {
    const normalizedEmail = input.email.toLowerCase().trim();

    // Look up user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const userPayload: AuthUserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = this.generateToken(userPayload);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.sanitizeUser(user);
  }
}

export const authService = new AuthService();
