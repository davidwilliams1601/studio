import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // This is now a dynamic route that can use request.url
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription verify endpoint' 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to verify subscription' },
      { status: 500 }
    );
  }
}
