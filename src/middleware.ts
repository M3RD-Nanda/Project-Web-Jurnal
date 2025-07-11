import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next();

  // Add pathname to headers for analytics
  const pathname = request.nextUrl.pathname;
  response.headers.set("x-pathname", pathname);

  // Simple session handling without Supabase SSR to avoid Edge Runtime issues
  // Session refresh will be handled by SessionProvider on client-side

  return response;
}

export const config = {
  matcher: [
    // Temporarily disable all middleware to fix exports error
    // The session refresh will be handled by SessionProvider on client-side
  ],
};
