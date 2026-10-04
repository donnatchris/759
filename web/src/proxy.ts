import { NextResponse, type NextRequest } from 'next/server';
import {
  isBlogEnabled,
  isEventsEnabled,
  isMenuEnabled,
  isPrestationsEnabled,
} from '@/settings/settings.helpers';

// Reject disabled routes before the root layout can start streaming a 200.
export function proxy(request: NextRequest) {
  const segment = request.nextUrl.pathname.split('/')[1];
  const disabled =
    (segment === 'menu' && !isMenuEnabled()) ||
    (segment === 'prestations' && !isPrestationsEnabled()) ||
    (segment === 'evenements' && !isEventsEnabled()) ||
    (segment === 'blog' && !isBlogEnabled());

  if (disabled) {
    const url = request.nextUrl.clone();
    url.pathname = '/_not-found';
    url.search = '';
    return NextResponse.rewrite(url, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/evenements/:path*',
    '/menu/:path*',
    '/prestations/:path*',
    '/blog/:path*',
  ],
};
