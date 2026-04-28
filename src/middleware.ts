import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  // Skip rewrite for the apex domain, www, localhost, and Vercel preview URLs
  const isApex = hostname === 'truos.ai' || hostname === 'www.truos.ai';
  const isLocal = hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1');
  const isVercelPreview = hostname.endsWith('.vercel.app');

  if (isApex || isLocal || isVercelPreview) {
    return NextResponse.next();
  }

  // Subdomain pattern: <tenant>.truos.ai → rewrite to /<tenant>/<path>
  if (hostname.endsWith('.truos.ai')) {
    const tenant = hostname.split('.')[0];
    // Avoid double-rewriting if path already starts with the tenant
    if (!url.pathname.startsWith(`/${tenant}`)) {
      url.pathname = `/${tenant}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except Next.js internals, static files, and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
