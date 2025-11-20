import { Context } from 'hono';
import { profileService } from '@/services/profile.service';
import { updateProfileSchema, changePasswordSchema } from '@/validations/profile.schema';
import { ValidationError } from '@/utils/errors';
import { z } from 'zod';

export class ProfileController {
  async getProfile(c: Context) {
    const userId = c.get('userId');
    const profile = await profileService.getProfile(userId);
    return c.json(profile);
  }

  async updateProfile(c: Context) {
    const userId = c.get('userId');
    const body = await c.req.json();

    // Validate request body
    const validated = updateProfileSchema.parse(body);

    const updatedProfile = await profileService.updateProfile(userId, validated);
    return c.json(updatedProfile);
  }

  async changePassword(c: Context) {
    const userId = c.get('userId');
    const body = await c.req.json();

    // Validate request body
    const validated = changePasswordSchema.parse(body);

    const result = await profileService.changePassword(userId, validated);
    return c.json(result);
  }

  async deleteAccount(c: Context) {
    const userId = c.get('userId');
    const body = await c.req.json();

    // Validate password is provided
    const deleteAccountSchema = z.object({
      password: z.string().min(1, 'Password is required'),
    });

    const { password } = deleteAccountSchema.parse(body);

    const result = await profileService.deleteAccount(userId, password);
    return c.json(result);
  }
}

export const profileController = new ProfileController();
