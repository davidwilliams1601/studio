import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { verifyAdminAccess, createAuditLog, validateReason } from '@/lib/admin-auth';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Admin Bulk Email Endpoint
 * Send filtered emails to users based on tier and subscription status
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const admin = await verifyAdminAccess(request);

    // Rate limiting - 1 bulk email per hour
    const rateLimitResult = checkRateLimit(admin.uid, RATE_LIMITS.ADMIN_BULK_EMAIL);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. You can send bulk emails once per hour.',
          resetAt: new Date(rateLimitResult.resetAt).toISOString(),
        },
        { status: 429 }
      );
    }

    const { subject, message, tiers, statuses, testMode } = await request.json();

    // Validation
    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!tiers || tiers.length === 0) {
      return NextResponse.json(
        { error: 'At least one tier must be selected' },
        { status: 400 }
      );
    }

    if (!statuses || statuses.length === 0) {
      return NextResponse.json(
        { error: 'At least one status must be selected' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Build query for recipients
    let recipientsQuery = db.collection('users');

    // Filter by tiers (if not all selected)
    if (tiers.length < 4) {
      recipientsQuery = recipientsQuery.where('tier', 'in', tiers) as any;
    }

    // Fetch users
    const snapshot = await recipientsQuery.get();
    let recipients = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          email: data.email,
          name: data.displayName || data.email.split('@')[0],
          tier: data.tier || 'free',
          status: data.subscriptionStatus || 'active',
        };
      })
      .filter(user => user.email); // Only users with email

    // Filter by status (client-side since Firestore can't do IN on both fields)
    recipients = recipients.filter(user => statuses.includes(user.status));

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients match the selected filters' },
        { status: 400 }
      );
    }

    console.log(`📧 Preparing to send email to ${recipients.length} recipients`);
    console.log(`Test mode: ${testMode ? 'ON' : 'OFF'}`);

    // Test mode: send only to admin
    if (testMode) {
      recipients = [{
        email: admin.email,
        name: 'Admin',
        tier: 'admin' as any,
        status: 'test',
      }];
      console.log(`📧 Test mode: Sending to admin email only (${admin.email})`);
    }

    // Lazy import EmailService
    const { EmailService } = await import('@/lib/email-service');

    // Send emails
    const results = {
      total: recipients.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send emails in batches to avoid overwhelming the service
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const promises = batch.map(async (recipient) => {
        try {
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: #3b82f6; color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
                  .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none; }
                  .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
                  .message { white-space: pre-wrap; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1 style="margin: 0;">LinkStream</h1>
                </div>
                <div class="content">
                  <p>Hi ${recipient.name},</p>
                  <div class="message">${message}</div>
                  ${testMode ? '<p style="background: #fef3c7; padding: 10px; border-radius: 4px;"><strong>🧪 TEST MODE:</strong> This is a test email</p>' : ''}
                </div>
                <div class="footer">
                  <p>This email was sent by LinkStream Admin</p>
                  <p>© ${new Date().getFullYear()} LinkStream. All rights reserved.</p>
                </div>
              </body>
            </html>
          `;

          const result = await EmailService.sendEmail({
            to: recipient.email,
            subject: testMode ? `[TEST] ${subject}` : subject,
            html,
          });

          if (result.success) {
            results.sent++;
          } else {
            results.failed++;
            results.errors.push(`${recipient.email}: ${result.error}`);
          }
        } catch (error: any) {
          results.failed++;
          results.errors.push(`${recipient.email}: ${error.message}`);
        }
      });

      await Promise.all(promises);

      // Small delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Create audit log
    await createAuditLog(
      admin,
      {
        type: 'bulk_email',
        details: {
          subject,
          tiers,
          statuses,
          testMode,
          recipientCount: results.total,
          sent: results.sent,
          failed: results.failed,
        },
        targetUserId: undefined,
        targetUserEmail: undefined,
      },
      request,
      results.failed === 0 ? 'success' : 'failed'
    );

    console.log(`✅ Bulk email complete: ${results.sent} sent, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      message: `Email sent to ${results.sent} of ${results.total} recipients`,
      results,
    });
  } catch (error: any) {
    console.error('Bulk email endpoint error:', error);

    const isAuthError =
      error.message?.includes('Admin access') ||
      error.message?.includes('token');
    const statusCode = isAuthError ? 403 : 500;

    return NextResponse.json(
      { error: error.message || 'Failed to send emails' },
      { status: statusCode }
    );
  }
}
