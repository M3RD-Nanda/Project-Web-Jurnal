import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next();

  // Add pathname header for analytics (Edge Runtime compatible)
  const pathname = request.nextUrl.pathname;
  response.headers.set("x-pathname", pathname);

  // Add basic caching headers for static assets (Edge Runtime compatible)
  if (
    pathname.startsWith("/_next/static/") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".woff") ||
    pathname.endsWith(".woff2")
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  }

  return response;
}

export const config = {
  matcher: [
    // Very simple matcher - only for pages that need analytics
    "/((?!api|_next|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
