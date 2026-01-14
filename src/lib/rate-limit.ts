/**
 * Simple in-memory rate limiter
 * NOTE: For production with multiple instances, use Redis (Upstash) or Vercel Edge Config
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  maxRequests: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Optional custom identifier (defaults to IP address)
   */
  identifier?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., user ID, IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `${identifier}:${config.maxRequests}:${config.windowMs}`;

  let record = rateLimitStore.get(key);

  // Create new record if it doesn't exist or has expired
  if (!record || now > record.resetAt) {
    record = {
      count: 0,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, record);
  }

  // Increment request count
  record.count++;

  const allowed = record.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - record.count);

  return {
    allowed,
    remaining,
    resetAt: record.resetAt,
    limit: config.maxRequests,
  };
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Stripe checkout - prevent abuse
  STRIPE_CHECKOUT: {
    maxRequests: 5, // 5 checkout sessions
    windowMs: 15 * 60 * 1000, // per 15 minutes
  },

  // File uploads - prevent storage abuse
  FILE_UPLOAD: {
    maxRequests: 10, // 10 uploads
    windowMs: 60 * 60 * 1000, // per hour
  },

  // Account deletion - prevent accidental mass deletions
  ACCOUNT_DELETE: {
    maxRequests: 1, // 1 deletion
    windowMs: 24 * 60 * 60 * 1000, // per 24 hours
  },

  // Email sending - prevent spam
  EMAIL_SEND: {
    maxRequests: 10, // 10 emails
    windowMs: 60 * 60 * 1000, // per hour
  },

  // AI analysis - prevent API quota exhaustion
  AI_ANALYSIS: {
    maxRequests: 20, // 20 requests
    windowMs: 60 * 60 * 1000, // per hour
  },

  // General API - default rate limit
  GENERAL: {
    maxRequests: 100, // 100 requests
    windowMs: 15 * 60 * 1000, // per 15 minutes
  },

  // Admin bulk email - prevent spam
  ADMIN_BULK_EMAIL: {
    maxRequests: 1, // 1 bulk email
    windowMs: 60 * 60 * 1000, // per hour
  },

  // Admin users list - reasonable access
  ADMIN_USERS_LIST: {
    maxRequests: 100, // 100 requests
    windowMs: 60 * 60 * 1000, // per hour
  },

  // Admin user modifications - prevent abuse
  ADMIN_USER_MODIFY: {
    maxRequests: 50, // 50 modifications
    windowMs: 60 * 60 * 1000, // per hour
  },

  // Admin user deletion - critical action
  ADMIN_DELETE_USER: {
    maxRequests: 10, // 10 deletions
    windowMs: 60 * 60 * 1000, // per hour
  },
};

/**
 * Extract identifier from request (IP address or user ID)
 */
export function getRequestIdentifier(
  request: Request,
  userId?: string
): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get real IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0].trim() || realIp || 'unknown';

  return `ip:${ip}`;
}
