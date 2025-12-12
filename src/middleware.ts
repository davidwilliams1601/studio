import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip middleware entirely - authentication is handled client-side
  // This avoids RSC payload issues and complex session verification
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
