import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken, CSRF_COOKIE_NAME } from '@/lib/csrf';

export const dynamic = 'force-dynamic';

/**
 * GET /api/csrf
 *
 * Returns a CSRF token for the client to use in subsequent requests
 * Token is set as both a cookie and returned in the response
 *
 * If a valid token already exists in the cookie, it will be reused
 * to prevent race conditions when the endpoint is called multiple times
 */
export async function GET(request: NextRequest) {
  // Check if there's already a valid token in the cookie
  const existingToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  // Reuse existing token if present and valid (64 hex chars)
  const token = existingToken && existingToken.length === 64 && /^[a-f0-9]+$/.test(existingToken)
    ? existingToken
    : generateCsrfToken();

  const response = NextResponse.json({
    token,
  });

  // Set CSRF token as HTTP-only cookie (refresh expiry even if token is reused)
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return response;
}
