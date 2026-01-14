import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin';
import { getDb } from '@/lib/firebase-admin';

/**
 * Admin authentication and authorization utilities
 */

export interface AdminUser {
  uid: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Verify that the request is from an authenticated admin user
 * Throws an error if not authorized
 */
export async function verifyAdminAccess(request: NextRequest): Promise<AdminUser> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization header');
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the Firebase ID token
    const decodedToken = await verifyIdToken(idToken);

    // Check if user has admin custom claim
    if (!decodedToken.admin) {
      console.warn(`⚠️ Unauthorized admin access attempt by ${decodedToken.email}`);
      throw new Error('Admin access required. User does not have admin privileges.');
    }

    console.log(`✅ Admin access granted to ${decodedToken.email}`);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      isAdmin: true,
    };
  } catch (error: any) {
    console.error('Admin access verification failed:', error);

    if (error.message?.includes('Admin access required')) {
      throw error;
    }

    throw new Error('Unauthorized: ' + (error.message || 'Invalid authentication'));
  }
}

/**
 * Create an audit log entry for admin actions
 */
export async function createAuditLog(params: {
  adminUid: string;
  adminEmail: string;
  action: string;
  targetUid?: string;
  targetEmail?: string;
  reason?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    const db = await getDb();

    await db.collection('adminAuditLogs').add({
      adminUid: params.adminUid,
      adminEmail: params.adminEmail,
      action: params.action,
      targetUid: params.targetUid || null,
      targetEmail: params.targetEmail || null,
      reason: params.reason || null,
      metadata: params.metadata || {},
      timestamp: new Date(),
    });

    console.log(`📝 Audit log created: ${params.action} by ${params.adminEmail}`);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit log failure shouldn't block the operation
  }
}

/**
 * Validate that a reason string is provided and meets minimum requirements
 */
export function validateReason(reason: string | undefined): string {
  if (!reason || reason.trim().length === 0) {
    throw new Error('Reason is required for this admin action');
  }

  const trimmedReason = reason.trim();

  if (trimmedReason.length < 10) {
    throw new Error('Reason must be at least 10 characters long');
  }

  if (trimmedReason.length > 500) {
    throw new Error('Reason must be no more than 500 characters');
  }

  return trimmedReason;
}

/**
 * Get admin user from request (returns null if not admin)
 * Non-throwing version of verifyAdminAccess
 */
export async function getAdminUser(request: NextRequest): Promise<AdminUser | null> {
  try {
    return await verifyAdminAccess(request);
  } catch (error) {
    return null;
  }
}
