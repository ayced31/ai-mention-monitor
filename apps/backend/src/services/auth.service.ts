import bcrypt from "bcryptjs";
const { hash, compare } = bcrypt;
import { prisma } from "../config/database.js";
import { generateTokens, verifyToken } from "../utils/jwt.js";
import { ConflictError, UnauthorizedError } from "../utils/errors.js";
import type { RegisterInput, LoginInput } from "../validations/auth.schema.js";

export class AuthService {
  async register(data: RegisterInput) {
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictError("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await generateTokens(user.id);

    return { user, ...tokens };
  }

  async login(data: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Verify password
    const isValid = await compare(data.password, user.password);

    if (!isValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Generate tokens
    const tokens = await generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = await verifyToken(refreshToken);

      if (decoded.type !== "refresh") {
        throw new UnauthorizedError("Invalid token type");
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      const tokens = await generateTokens(user.id);
      return tokens;
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    return user;
  }
}

export const authService = new AuthService();
