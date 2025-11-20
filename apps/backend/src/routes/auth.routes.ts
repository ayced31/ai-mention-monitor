import { Hono } from 'hono';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validations/auth.schema.js';

const auth = new Hono();

auth.post('/register', validate(registerSchema), (c) => authController.register(c));
auth.post('/login', validate(loginSchema), (c) => authController.login(c));
auth.post('/refresh', validate(refreshTokenSchema), (c) => authController.refresh(c));
auth.get('/me', authMiddleware, (c) => authController.getMe(c));

export default auth;
