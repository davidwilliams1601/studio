import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // This is now a dynamic route that can use request headers
    return NextResponse.json({ 
      success: true, 
      message: 'Reminders check endpoint' 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to check reminders' },
      { status: 500 }
    );
  }
}
