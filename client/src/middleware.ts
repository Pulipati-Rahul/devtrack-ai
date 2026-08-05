import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionToken = 
    request.cookies.get('better-auth.session_token') || 
    request.cookies.get('__Secure-better-auth.session_token');

  // Skip prefetch requests to improve routing performance
  if (request.headers.get('next-router-prefetch') === '1') {
    return NextResponse.next();
  }

  // Allow public portfolio routes to bypass authentication checks
  if (request.nextUrl.pathname.startsWith('/portfolio/') && request.nextUrl.pathname !== '/portfolio') {
    return NextResponse.next();
  }

  // If no cookie exists, redirect to login
  if (!sessionToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set('x-middleware-cache', 'no-cache');
  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/resume/:path*',
    '/projects/:path*',
    '/portfolio/:path*',
    '/dsa/:path*',
    '/interview/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/admin/:path*',
  ],
};
