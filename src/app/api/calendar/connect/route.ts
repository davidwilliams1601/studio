// src/app/api/calendar/connect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { code, userId } = await req.json();

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Missing authorization code or user ID' },
        { status: 400 }
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokens.error_description || 'Failed to get access token');
    }

    // Store calendar integration
    await db.collection('users').doc(userId).update({
      calendarIntegration: {
        provider: 'google',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        calendarId: 'primary',
        connectedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Calendar connected successfully!'
    });

  } catch (error: any) {
    console.error('Calendar connect error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect calendar' },
      { status: 500 }
    );
  }
}
