import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from './db';

const SESSION_COOKIE_NAME = 'lifequest_session';
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

// Secret key for JWT signing
function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || 'fallback-super-secret-lifequest-key-change-in-env-32-chars';
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  username: string;
  email: string;
  role: 'admin';
}

// 1. Password Hashing & Verification
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 2. JWT Session Generation & Verification
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      email: payload.email as string,
      role: 'admin',
    };
  } catch {
    return null;
  }
}

// 3. Cookie Management
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION,
  });
}

export async function removeSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

// 4. Server-Side Route / Component Auth Helper
export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// 5. API Route Guard: returns session or null / throws
export async function requireAuth(req?: NextRequest): Promise<SessionPayload | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  }

  if (!token) return null;
  return verifySessionToken(token);
}

// 6. Ensure default Admin exists in DB (Auto-initialization fallback)
export async function ensureAdminUser() {
  const adminCount = await db.user.count();
  if (adminCount === 0) {
    const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
    const defaultEmail = process.env.ADMIN_EMAIL || 'admin@lifequest.local';
    const defaultPassword = process.env.ADMIN_INITIAL_PASSWORD || 'ChangeMeQuest2025!';

    const passwordHash = await hashPassword(defaultPassword);
    const user = await db.user.create({
      data: {
        username: defaultUsername,
        email: defaultEmail,
        passwordHash,
      },
    });
    return user;
  }
  return null;
}
