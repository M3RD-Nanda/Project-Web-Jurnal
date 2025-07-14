import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add pathname header for analytics
  response.headers.set("x-pathname", request.nextUrl.pathname);

  return response;
}

export const config = {
  matcher: [
    // Temporarily disable middleware to fix Edge Runtime error
    // "/((?!api|_next|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
