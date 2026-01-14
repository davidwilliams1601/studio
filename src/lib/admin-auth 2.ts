// src/lib/admin-auth.ts
import { NextRequest } from 'next/server';
import { verifyIdToken } from './firebase-admin';
import { getDb } from './firebase-admin';

export interface AdminUser {
  uid: string;
  email: string;
  isAdmin: boolean;
}

export interface AuditLogAction {
  type: 'tier_change' | 'subscription_cancel' | 'user_delete' | 'bulk_email' | 'role_grant' | 'stripe_sync';
  details: {
    oldValue?: any;
    newValue?: any;
    reason?: string;
    affectedCount?: number;
    emailSubject?: string;
    [key: string]: any;
  };
  targetUserId?: string;
  targetUserEmail?: string;
}

/**
 * Verify admin access for API routes
 * - Checks Firebase ID token validity
 * - Verifies isAdmin field from Firestore
 * - Returns admin user data or throws error
 */
export async function verifyAdminAccess(request: NextRequest): Promise<AdminUser> {
  // 1. Extract Bearer token
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Authentication required');
  }

  const idToken = authHeader.split('Bearer ')[1];
  if (!idToken) {
    throw new Error('Invalid authorization header');
  }

  // 2. Verify Firebase ID token
  let decodedToken;
  try {
    decodedToken = await verifyIdToken(idToken);
  } catch (error: any) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }

  // 3. Check isAdmin field in Firestore
  const db = await getDb();
  const userDoc = await db.collection('users').doc(decodedToken.uid).get();

  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const userData = userDoc.data();
  if (!userData?.isAdmin) {
    throw new Error('Admin access required');
  }

  return {
    uid: decodedToken.uid,
    email: userData.email || decodedToken.email || 'unknown',
    isAdmin: true,
  };
}

/**
 * Create audit log entry for admin actions
 * Logs all administrative operations with full context
 */
export async function createAuditLog(
  admin: AdminUser,
  action: AuditLogAction,
  request: NextRequest,
  status: 'success' | 'failed' = 'success',
  errorMessage?: string
): Promise<void> {
  try {
    const db = await getDb();

    // Extract request metadata
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';

    const logEntry = {
      timestamp: new Date(),
      adminUid: admin.uid,
      adminEmail: admin.email,
      action: action.type,
      targetUserId: action.targetUserId || null,
      targetUserEmail: action.targetUserEmail || null,
      details: action.details,
      ipAddress,
      userAgent,
      status,
      errorMessage: errorMessage || null,
    };

    await db.collection('adminAuditLogs').add(logEntry);

    console.log(`📝 Audit log created: ${action.type} by ${admin.email}`, {
      status,
      targetUser: action.targetUserEmail || action.targetUserId,
    });
  } catch (error: any) {
    // Don't throw - audit logging failure shouldn't break the operation
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Helper to extract request context for logging
 */
export function getRequestContext(request: NextRequest) {
  return {
    ipAddress:
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
}

/**
 * Validate admin action reason (required for sensitive operations)
 */
export function validateReason(reason: string | undefined): string {
  if (!reason || reason.trim().length < 3) {
    throw new Error('Reason is required and must be at least 3 characters');
  }
  return reason.trim();
}
