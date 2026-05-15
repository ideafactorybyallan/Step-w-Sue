import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { SessionUser } from './types';

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET!);

// ── Session (user) ────────────────────────────────────────────────────────────

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    nickname: user.nickname,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: payload.id as string,
      first_name: payload.first_name as string,
      last_name: payload.last_name as string,
      nickname: (payload.nickname as string) ?? null,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get('swc_session')?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const SESSION_COOKIE = {
  name: 'swc_session',
  opts: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  },
};

// ── Challenge password (short-lived, verifies family password entry) ──────────

export const CHALLENGE_COOKIE = {
  name: 'swc_challenge',
  opts: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 10,
    path: '/',
  },
};

// ── Admin session ─────────────────────────────────────────────────────────────

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('4h')
    .sign(secret());
}

export async function getAdminSession(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get('swc_admin')?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE = {
  name: 'swc_admin',
  opts: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 4,
    path: '/',
  },
};
