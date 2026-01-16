// src/app/api/users/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import type { SubscriptionTier } from '@/lib/subscription-tiers';

export const dynamic = 'force-dynamic';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received user creation request');

    const { userId, email, displayName, tier } = await request.json();
    console.log(`📋 Request data: userId=${userId}, email=${email}, tier=${tier}`);

    if (!userId || !email) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'userId and email are required' },
        { status: 400 }
      );
    }

    console.log('🔄 Initializing Firestore connection...');
    const db = await getDb();
    console.log('✅ Firestore connection established');

    const userRef = db.collection('users').doc(userId);

    // Check if user already exists
    console.log('🔍 Checking if user exists...');
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      console.log('ℹ️ User already exists');
      // User already exists, don't recreate
      return NextResponse.json({
        success: true,
        created: false,
        message: 'User already exists',
      });
    }

    // Create new user document
    console.log('📝 Creating new user document...');
    const now = new Date();
    const userData = {
      email,
      displayName: displayName || (email && typeof email === 'string' ? email.split('@')[0] : 'User'),
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
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      {
        error: 'Failed to create user document',
        message: error.message,
        code: error.code,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
