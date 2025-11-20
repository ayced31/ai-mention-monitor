import { Context } from 'hono';
import { authService } from '../services/auth.service.js';
import type { RegisterInput, LoginInput, RefreshTokenInput } from '../validations/auth.schema.js';

export class AuthController {
  async register(c: Context) {
    const data = c.get('validatedData') as RegisterInput;
    const result = await authService.register(data);
    
    return c.json(result, 201);
  }

  async login(c: Context) {
    const data = c.get('validatedData') as LoginInput;
    const result = await authService.login(data);
    
    return c.json(result);
  }

  async refresh(c: Context) {
    const data = c.get('validatedData') as RefreshTokenInput;
    const result = await authService.refresh(data.refreshToken);
    
    return c.json(result);
  }

  async getMe(c: Context) {
    const userId = c.get('userId') as string;
    const user = await authService.getMe(userId);
    
    return c.json({ user });
  }
}

export const authController = new AuthController();
