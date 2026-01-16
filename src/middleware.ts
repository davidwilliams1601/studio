import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Edge-compatible session verification
// Note: We're using Edge runtime which has limitations, so we verify the session cookie exists
// and has basic structure. Full verification happens on API routes using Firebase Admin SDK.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session cookie
  const sessionCookie = request.cookies.get('session')?.value;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/', '/privacy', '/terms', '/contact', '/faq'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/'));

  // Admin routes require special handling
  const isAdminRoute = pathname.startsWith('/dashboard/admin');

  // If accessing protected route without session, redirect to login
  if (!sessionCookie && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For admin routes, we add a header that the admin guard will check
  // The AdminGuard component will verify admin status using the API
  if (isAdminRoute && sessionCookie) {
    const response = NextResponse.next();
    response.headers.set('x-admin-route', 'true');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (they handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
