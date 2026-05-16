import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) {
  throw new Error('JWT_SECRET environment variable is required.');
}
const SECRET = new TextEncoder().encode(rawSecret);

const PROTECTED = ['/home', '/leaderboard', '/steps'];
const ADMIN_PROTECTED = ['/admin/dashboard'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PROTECTED.some((p) => pathname.startsWith(p))) {
    const token = request.cookies.get('swc_session')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    try {
      await jwtVerify(token, SECRET);
    } catch {
      const res = NextResponse.redirect(new URL('/', request.url));
      res.cookies.delete('swc_session');
      return res;
    }
  }

  if (ADMIN_PROTECTED.some((p) => pathname.startsWith(p))) {
    const token = request.cookies.get('swc_admin')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    try {
      await jwtVerify(token, SECRET);
    } catch {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home/:path*',
    '/leaderboard/:path*',
    '/steps/:path*',
    '/admin/dashboard/:path*',
  ],
};
