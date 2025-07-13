import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next();

  // Add pathname to headers for analytics
  const pathname = request.nextUrl.pathname;
  response.headers.set("x-pathname", pathname);

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Simple session handling without Supabase SSR to avoid Edge Runtime issues
  // Session refresh will be handled by SessionProvider on client-side

  return response;
}

export const config = {
  matcher: [
    // Enable middleware for specific routes that need analytics and security
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
