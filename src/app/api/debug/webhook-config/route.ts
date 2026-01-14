import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * DEBUG ENDPOINT - Check webhook configuration
 */
export async function GET(request: NextRequest) {
  try {
    const hasSecret = !!process.env.STRIPE_WEBHOOK_SECRET;
    const secretLength = process.env.STRIPE_WEBHOOK_SECRET?.length || 0;
    const secretPrefix = process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10) || '';

    return NextResponse.json({
      hasSecret,
      secretLength,
      secretPrefix,
      expectedLength: 'whsec_Mwndadps0OT0SZHCEvNQ2rFt2x0xFTuc'.length,
      note: 'Showing first 10 chars only for security'
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
