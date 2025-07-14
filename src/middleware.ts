import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  try {
    // Create response with minimal processing
    const response = NextResponse.next();

    // Only add pathname header for analytics - keep it simple
    const pathname = request.nextUrl.pathname;
    response.headers.set("x-pathname", pathname);

    return response;
  } catch (error) {
    // Fallback: return basic response if anything fails
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Disable middleware temporarily if Edge Runtime issues persist
    // Security headers are handled by next.config.ts instead
    // "/",
    // "/articles/:path*",
    // "/announcements/:path*",
  ],
};
