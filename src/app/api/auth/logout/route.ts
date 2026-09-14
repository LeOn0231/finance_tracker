import { NextResponse } from 'next/server';
import { removeSessionCookie } from '@/lib/auth';

export async function POST() {
  try {
    await removeSessionCookie();
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
