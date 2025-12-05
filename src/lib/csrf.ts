import crypto from 'crypto';

/**
 * CSRF Protection Utility
 * Protects against Cross-Site Request Forgery attacks
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf_token';

/**
 * Generate a secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Verify CSRF token from request
 * Checks both header and cookie match
 */
export function verifyCsrfToken(
  tokenFromHeader: string | null,
  tokenFromCookie: string | null
): boolean {
  if (!tokenFromHeader || !tokenFromCookie) {
    return false;
  }

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(tokenFromHeader),
      Buffer.from(tokenFromCookie)
    );
  } catch {
    // Buffers not the same length
    return false;
  }
}

/**
 * Extract CSRF token from request headers and cookies
 */
export function getCsrfTokens(request: Request): {
  headerToken: string | null;
  cookieToken: string | null;
} {
  const headerToken = request.headers.get('x-csrf-token');
  const cookieHeader = request.headers.get('cookie');

  let cookieToken: string | null = null;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const csrfCookie = cookies.find(c => c.startsWith(`${CSRF_COOKIE_NAME}=`));
    if (csrfCookie) {
      cookieToken = csrfCookie.split('=')[1];
    }
  }

  return { headerToken, cookieToken };
}

/**
 * Check if request method requires CSRF protection
 */
export function requiresCsrfProtection(method: string): boolean {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  return !safeMethods.includes(method.toUpperCase());
}

export const CSRF_HEADER_NAME = 'x-csrf-token';
export { CSRF_COOKIE_NAME };
