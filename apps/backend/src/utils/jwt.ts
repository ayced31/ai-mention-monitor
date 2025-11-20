import { SignJWT, jwtVerify } from 'jose';
import { env } from '../config/index.js';

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);

export async function generateTokens(userId: string) {
  const accessToken = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRY)
    .sign(JWT_SECRET);

  const refreshToken = await new SignJWT({ userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.REFRESH_EXPIRY)
    .sign(JWT_SECRET);

  return { accessToken, refreshToken };
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as { userId: string; type?: string };
}
