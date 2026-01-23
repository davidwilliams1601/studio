// src/lib/unsubscribe-token.ts
import { createHash, randomBytes } from 'crypto';

/**
 * Generate a secure unsubscribe token for an email address
 * Token format: base64(email:timestamp:signature)
 */
export function generateUnsubscribeToken(email: string): string {
  const timestamp = Date.now().toString();
  const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-change-me';

  // Create signature: hash(email + timestamp + secret)
  const signature = createHash('sha256')
    .update(`${email}:${timestamp}:${secret}`)
    .digest('hex')
    .substring(0, 16); // Use first 16 chars for shorter token

  // Combine email, timestamp, and signature
  const tokenData = `${email}:${timestamp}:${signature}`;

  // Base64 encode for URL safety
  return Buffer.from(tokenData).toString('base64url');
}

/**
 * Verify and decode an unsubscribe token
 * Returns the email if valid, null if invalid or expired
 */
export function verifyUnsubscribeToken(token: string): { email: string; valid: boolean; reason?: string } {
  try {
    // Decode from base64
    const tokenData = Buffer.from(token, 'base64url').toString('utf-8');
    const [email, timestamp, providedSignature] = tokenData.split(':');

    if (!email || !timestamp || !providedSignature) {
      return { email: '', valid: false, reason: 'Invalid token format' };
    }

    // Check expiration (tokens valid for 90 days)
    const tokenAge = Date.now() - parseInt(timestamp, 10);
    const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds

    if (tokenAge > maxAge) {
      return { email, valid: false, reason: 'Token expired' };
    }

    // Verify signature
    const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-change-me';
    const expectedSignature = createHash('sha256')
      .update(`${email}:${timestamp}:${secret}`)
      .digest('hex')
      .substring(0, 16);

    if (providedSignature !== expectedSignature) {
      return { email: '', valid: false, reason: 'Invalid signature' };
    }

    return { email, valid: true };
  } catch (error) {
    console.error('Token verification error:', error);
    return { email: '', valid: false, reason: 'Verification failed' };
  }
}

/**
 * Generate an unsubscribe URL for an email address
 */
export function generateUnsubscribeUrl(email: string): string {
  const token = generateUnsubscribeToken(email);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lstream.app';
  return `${appUrl}/unsubscribe/${token}`;
}
