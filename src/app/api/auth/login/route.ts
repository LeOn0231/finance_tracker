import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyPassword, createSessionToken, setSessionCookie, ensureAdminUser } from '@/lib/auth';

const loginSchema = z.object({
  identifier: z.string().optional(),
  username: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
}).refine((data) => Boolean(data.identifier || data.username), {
  message: 'Username or email is required',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const identifier = (result.data.identifier || result.data.username || '').trim();
    const { password } = result.data;

    // Ensure initial admin user exists
    await ensureAdminUser();

    // Look up user by username or email
    const user = await db.user.findFirst({
      where: {
        OR: [
          { username: identifier.trim() },
          { email: identifier.trim().toLowerCase() },
        ],
      },
    });

    if (!user) {
      // Return generic invalid credentials for security
      return NextResponse.json(
        { error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: 'admin',
    });

    // Set secure cookie
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
