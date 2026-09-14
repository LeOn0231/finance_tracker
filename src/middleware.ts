import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/robots.txt', '/favicon.ico'];

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || 'fallback-super-secret-lifequest-key-change-in-env-32-chars';
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public static assets and API login
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static');

  const token = request.cookies.get('lifequest_session')?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, getJwtSecret());
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // 2. If authenticated user visits /login, redirect to dashboard
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. If unauthenticated user tries to access protected page or API
  if (!isPublicPath && !isAuthenticated) {
    // For API requests, return JSON 401 Unauthorized
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login to access Life Quest.' },
        { status: 401 }
      );
    }
    // For page requests, redirect to /login
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 4. Inject strict privacy headers
  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
