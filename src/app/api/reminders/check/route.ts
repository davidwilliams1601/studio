
import { NextRequest, NextResponse } from 'next/server';
import { CalendarReminderService } from '@/lib/calendar-integration';
import { shouldSendReminder } from '@/lib/subscription-tiers';
import { getDb } from '@/lib/firebase-admin';

// This would be called by a cron job (Vercel Cron, GitHub Actions, etc.)
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const remindersSent = [];
    
    const db = await getDb();
    // Query users who might need reminders
    const usersSnapshot = await db.collection('users')
      .where('reminderSettings.nextReminderDate', '<=', now)
      .get();

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const reminderSettings = userData.reminderSettings;
      
      if (!reminderSettings) continue;

      const { tier, lastBackupDate, lastReminderSent } = reminderSettings;
      
      const shouldSend = shouldSendReminder(
        tier,
        new Date(lastBackupDate.toDate()),
        lastReminderSent ? new Date(lastReminderSent.toDate()) : undefined
      );

      if (shouldSend.shouldSend) {
        // Generate email reminder
        const emailReminder = CalendarReminderService.generateEmailReminder(
          tier,
          userData.email,
          new Date(reminderSettings.nextReminderDate.toDate())
        );

        // Here you would integrate with your email service (SendGrid, Resend, etc.)
        // For now, we will log it.
        console.log(`Sending reminder to ${userData.email}`);
        console.log(`Subject: ${emailReminder.subject}`);


        // Update last reminder sent
        await db.collection('users').doc(userDoc.id).update({
          'reminderSettings.lastReminderSent': now
        });

        remindersSent.push({
          userId: userDoc.id,
          email: userData.email,
          tier,
          reminderType: shouldSend.reminderType
        });
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent: remindersSent.length,
      details: remindersSent
    });

  } catch (error: any) {
    console.error('Check reminders error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check reminders' },
      { status: 500 }
    );
  }
}
