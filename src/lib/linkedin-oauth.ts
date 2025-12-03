import crypto from 'crypto';
import {
  LinkedInTokenResponse,
  LinkedInUserInfo,
  LinkedInOAuthState,
} from '@/types/linkedin';

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';

/**
 * Generate a secure random state parameter for CSRF protection
 */
export function generateState(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate PKCE code verifier and challenge (optional but recommended)
 */
export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  return { codeVerifier, codeChallenge };
}

/**
 * Build LinkedIn authorization URL
 * Redirects user to LinkedIn for authentication
 */
export function buildAuthorizationUrl(
  state: string,
  codeChallenge?: string
): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
    state,
    scope: 'openid profile email', // Minimum required scopes
  });

  if (codeChallenge) {
    params.append('code_challenge', codeChallenge);
    params.append('code_challenge_method', 'S256');
  }

  return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string,
  codeVerifier?: string
): Promise<LinkedInTokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
  });

  if (codeVerifier) {
    params.append('code_verifier', codeVerifier);
  }

  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  return await response.json();
}

/**
 * Fetch user info from LinkedIn using access token
 * Uses OpenID Connect userinfo endpoint
 */
export async function fetchUserInfo(
  accessToken: string
): Promise<LinkedInUserInfo> {
  const response = await fetch(LINKEDIN_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch user info: ${error}`);
  }

  return await response.json();
}

/**
 * Validate environment variables for LinkedIn OAuth
 */
export function validateLinkedInConfig(): void {
  const required = [
    'LINKEDIN_CLIENT_ID',
    'LINKEDIN_CLIENT_SECRET',
    'LINKEDIN_REDIRECT_URI',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required LinkedIn OAuth environment variables: ${missing.join(', ')}`
    );
  }
}

/**
 * Encrypt sensitive data (access tokens, refresh tokens)
 * Uses AES-256-GCM encryption
 */
export function encryptToken(token: string): string {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.SESSION_SECRET!, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 */
export function decryptToken(encryptedToken: string): string {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.SESSION_SECRET!, 'salt', 32);

  const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Store OAuth state in a secure way (in-memory for simplicity, consider Redis for production)
 * This is a simple implementation; for production, use Redis or a database
 */
const stateStore = new Map<string, LinkedInOAuthState>();

// Clean up old states every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of stateStore.entries()) {
    if (now - data.createdAt > 10 * 60 * 1000) { // 10 minutes
      stateStore.delete(state);
    }
  }
}, 10 * 60 * 1000);

export function storeOAuthState(state: LinkedInOAuthState): void {
  stateStore.set(state.state, state);
}

export function getOAuthState(state: string): LinkedInOAuthState | undefined {
  return stateStore.get(state);
}

export function deleteOAuthState(state: string): void {
  stateStore.delete(state);
}
