import { prisma } from '@/config/database';
import { cache, CacheKeys } from '@/utils/cache';
import bcrypt from 'bcryptjs';
import { UnauthorizedError, ValidationError } from '@/utils/errors';
import type { UpdateProfileDto, ChangePasswordDto } from '@/validations/profile.schema';

export class ProfileService {
  async updateProfile(userId: string, data: UpdateProfileDto) {
    // Check if email is being changed and if it's already taken
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ValidationError('Email already in use');
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Invalidate cache
    await cache.invalidate(`user:${userId}:*`);

    return user;
  }

  async changePassword(userId: string, data: ChangePasswordDto) {
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(data.currentPassword, user.password);
    if (!isValidPassword) {
      throw new ValidationError('Current password is incorrect');
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(data.newPassword, user.password);
    if (isSamePassword) {
      throw new ValidationError('New password must be different from current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return { message: 'Password changed successfully' };
  }

  async getProfile(userId: string) {
    // Try cache first
    const cacheKey = CacheKeys.userProfile(userId);
    const cached = await cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            brands: true,
            alerts: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Cache for 10 minutes
    await cache.set(cacheKey, user, 600);

    return user;
  }

  async deleteAccount(userId: string, password: string) {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ValidationError('Password is incorrect');
    }

    // Delete user (cascades to all related data)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Clear all user caches
    await cache.invalidate(`user:${userId}:*`);

    return { message: 'Account deleted successfully' };
  }
}

export const profileService = new ProfileService();
