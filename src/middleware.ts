import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin-only routes
    const adminRoutes = ['/users'];
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/studies/:path*',
    '/medications/:path*',
    '/movements/:path*',
    '/stock/:path*',
    '/accounting/:path*',
    '/destruction/:path*',
    '/audit/:path*',
    '/exports/:path*',
    '/users/:path*',
    '/settings/:path*',
  ],
};
