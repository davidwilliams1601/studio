import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Check for Firebase auth cookie/session
    // Note: This is a basic check. For production, you should verify the Firebase ID token server-side
    const sessionCookie = request.cookies.get('session');

    if (!sessionCookie) {
      // Redirect to login if not authenticated
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
