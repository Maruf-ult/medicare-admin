import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('medicare_admin_token')?.value;
  const { pathname } = request.nextUrl;

  // ── Public routes ──────────────────────────────────────
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // ── Redirect to login if no token ──────────────────────
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ── Redirect to dashboard if already logged in ─────────
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};