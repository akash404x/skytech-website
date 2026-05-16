import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Firebase auth is client-side, so middleware can't check auth state
  // We'll let the client-side components handle auth redirects
  // This middleware is now a pass-through for all routes
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*'],
};
