// src/app/api/users/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import type { SubscriptionTier } from '@/lib/subscription-tiers';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, displayName, tier } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId and email are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const userRef = db.collection('users').doc(userId);

    // Check if user already exists
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      // User already exists, don't recreate
      return NextResponse.json({
        success: true,
        created: false,
        message: 'User already exists',
      });
    }

    // Create new user document
    const now = new Date();
    const userData = {
      email,
      displayName: displayName || email.split('@')[0],
      tier: (tier as SubscriptionTier) || 'free',
      createdAt: now,
      updatedAt: now,
      reminderSettings: {
        enabled: true,
        lastReminderSent: null,
        nextReminderDate: null,
        lastReminderType: null,
      },
      backupHistory: [],
      lastBackupDate: null,
      backupsThisMonth: 0,
    };

    await userRef.set(userData);

    console.log(`✅ Created user document for ${email}`);

    return NextResponse.json({
      success: true,
      created: true,
      message: 'User document created successfully',
      userId,
    });

  } catch (error: any) {
    console.error('❌ Error creating user document:', error);
    return NextResponse.json(
      {
        error: 'Failed to create user document',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
