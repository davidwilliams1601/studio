// src/app/api/cron/send-reminders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { shouldSendReminder, getNextReminderDate } from '@/lib/subscription-tiers';
import type { SubscriptionTier } from '@/lib/subscription-tiers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface UserData {
  email: string;
  displayName?: string;
  tier: SubscriptionTier;
  lastBackupDate?: Date;
  reminderSettings?: {
    lastReminderSent?: Date;
    nextReminderDate?: Date;
  };
}

export async function GET(request: NextRequest) {
  // Lazy import to avoid build-time evaluation of Resend
  const { EmailService } = await import('@/lib/email-service');

  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDb();
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No users found',
        remindersSent: 0,
      });
    }

    const now = new Date();
    let remindersSent = 0;
    let errors = 0;
    const results: Array<{ userId: string; email: string; status: string; error?: string }> = [];

    // Process each user
    for (const doc of snapshot.docs) {
      const userId = doc.id;
      const userData = doc.data() as UserData;

      // Skip users without email or tier
      if (!userData.email || !userData.tier) {
        console.log(`⏭️ Skipping user ${userId}: missing email or tier`);
        continue;
      }

      // Get last backup date (default to account creation or 30 days ago)
      const lastBackupDate = userData.lastBackupDate
        ? new Date(userData.lastBackupDate)
        : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get last reminder sent date
      const lastReminderSent = userData.reminderSettings?.lastReminderSent
        ? new Date(userData.reminderSettings.lastReminderSent)
        : undefined;

      // Check if reminder should be sent
      const reminderCheck = shouldSendReminder(
        userData.tier,
        lastBackupDate,
        lastReminderSent
      );

      if (reminderCheck.shouldSend) {
        console.log(`📧 Sending ${reminderCheck.reminderType} reminder to ${userData.email}`);

        // Calculate days until backup
        const nextBackupDate = getNextReminderDate(userData.tier, lastBackupDate);
        const daysUntil = Math.ceil((nextBackupDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Send reminder email
        const emailResult = await EmailService.sendBackupReminderEmail(
          userData.email,
          userData.tier,
          nextBackupDate,
          userData.displayName,
          daysUntil
        );

        if (emailResult.success) {
          // Update last reminder sent time in Firestore
          await usersRef.doc(userId).update({
            'reminderSettings.lastReminderSent': now,
            'reminderSettings.lastReminderType': reminderCheck.reminderType,
          });

          remindersSent++;
          results.push({
            userId,
            email: userData.email,
            status: 'sent',
          });
        } else {
          errors++;
          results.push({
            userId,
            email: userData.email,
            status: 'failed',
            error: emailResult.error,
          });
          console.error(`❌ Failed to send reminder to ${userData.email}:`, emailResult.error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${snapshot.size} users`,
      remindersSent,
      errors,
      timestamp: now.toISOString(),
      // Include results in development mode
      ...(process.env.NODE_ENV === 'development' && { results }),
    });

  } catch (error: any) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send reminders',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
