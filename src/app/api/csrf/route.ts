import { NextResponse } from 'next/server';
import { generateCsrfToken, CSRF_COOKIE_NAME } from '@/lib/csrf';

/**
 * GET /api/csrf
 *
 * Returns a CSRF token for the client to use in subsequent requests
 * Token is set as both a cookie and returned in the response
 */
export async function GET() {
  const token = generateCsrfToken();

  const response = NextResponse.json({
    token,
  });

  // Set CSRF token as HTTP-only cookie
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return response;
}
