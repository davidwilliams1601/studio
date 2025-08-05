
// src/app/api/reminders/setup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CalendarReminderService } from '@/lib/calendar-integration';
import { SubscriptionTier, getUserTierLimits } from '@/lib/subscription-tiers';
import { db } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { 
      userId, 
      tier, 
      lastBackupDate, 
      userEmail,
      calendarIntegration 
    } = await req.json();

    if (!userId || !tier || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const limits = getUserTierLimits(tier as SubscriptionTier);
    
    // Check if user's tier supports calendar integration
    if (!limits.calendarIntegration && calendarIntegration) {
      return NextResponse.json(
        { error: 'Calendar integration not available for your plan' },
        { status: 403 }
      );
    }

    const lastBackup = lastBackupDate ? new Date(lastBackupDate) : new Date();
    
    // Generate calendar event
    const calendarEvent = CalendarReminderService.generateBackupReminderEvent(
      tier as SubscriptionTier,
      lastBackup,
      userEmail
    );

    let calendarCreated = false;
    let icsFile = null;

    // If calendar integration is enabled and available
    if (calendarIntegration && limits.calendarIntegration) {
      if (calendarIntegration.provider === 'google' && calendarIntegration.accessToken) {
        calendarCreated = await CalendarReminderService.createGoogleCalendarEvent(
          calendarEvent,
          calendarIntegration.accessToken,
          calendarIntegration.calendarId
        );
      }
    }
    
    // Always provide ICS as fallback, regardless of integration status
    icsFile = CalendarReminderService.generateICSFile(calendarEvent);
    
    // Store reminder settings in database
    await db.collection('users').doc(userId).update({
      reminderSettings: {
        tier,
        lastBackupDate: lastBackup,
        nextReminderDate: calendarEvent.startDate,
        calendarIntegration: calendarIntegration || null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      calendarEvent,
      calendarCreated,
      icsFile,
      message: calendarCreated 
        ? 'Reminder successfully added to your calendar!' 
        : icsFile 
        ? 'ICS file generated for manual calendar import'
        : 'Reminder settings saved'
    });

  } catch (error: any) {
    console.error('Setup reminder error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to setup reminders' },
      { status: 500 }
    );
  }
}
