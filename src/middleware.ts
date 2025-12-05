import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[middleware] Request to:', pathname);

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    console.log('[middleware] Protected route detected');

    // Check for Firebase session cookie
    const sessionCookie = request.cookies.get('session');
    console.log('[middleware] Session cookie present:', !!sessionCookie);

    if (!sessionCookie) {
      // No session cookie - redirect to login
      console.log('[middleware] No session cookie, redirecting to login');
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    try {
      // Verify the session cookie with Firebase Admin SDK
      // We'll use a custom header to communicate with an API route
      // This avoids importing firebase-admin in Edge Runtime
      const verifyResponse = await fetch(new URL('/api/auth/session', request.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `session=${sessionCookie.value}`,
        },
      });

      if (!verifyResponse.ok) {
        // Invalid session - redirect to login
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', pathname);
        url.searchParams.set('error', 'session_expired');

        // Clear the invalid session cookie
        const response = NextResponse.redirect(url);
        response.cookies.delete('session');
        return response;
      }
    } catch (error) {
      // Error verifying session - redirect to login
      console.error('Session verification error:', error);
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);

      const response = NextResponse.redirect(url);
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
